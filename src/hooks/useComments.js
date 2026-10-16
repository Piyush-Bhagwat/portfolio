import { useState, useEffect, useRef, useCallback } from "react";
import { getDocs } from "firebase/firestore";
import { db } from "../services/firebase.js";
import {
  buildInitialCommentsQuery,
  buildPaginatedCommentsQuery,
  buildFallbackCommentsQuery,
  sortCommentsByDate,
  createCommentWithAggregate,
  toggleCommentVisibilityWithAggregate,
} from "../services/commentsService.js";

/**
 * useComments - Progressive Loading & Cursor-Based Pagination Hook
 *
 * Provides a scalable, decoupled community interaction pipeline for blog posts.
 * - Initial Tier 1 load: Strictly 3 visible comments.
 * - Cursor Pagination Tier 2: Fetches next 10 items on demand via startAfter(lastDocRef).
 * - Multi-tier Resilience: Automatic fallback to composite-index-free queries with in-memory sorting.
 * - Dual-Key Support: Matches by both Firestore document ID and human-readable slug.
 *
 * @param {string} postId - Target blog post identifier
 * @param {Object} [options={}] - Optional configuration
 * @param {number} [options.initialLimit=3] - Number of comments to load initially
 * @param {number} [options.pageSize=10] - Number of comments per paginated batch
 * @param {number} [options.totalCount] - Pre-aggregated comment_count from parent blog document
 * @param {string} [options.postSlug] - Optional human-readable post slug for dual-key matching
 * @param {import("firebase/firestore").Firestore} [options.firestoreDb] - Firestore instance override
 * @returns {{
 *   comments: Array<Object>,
 *   loading: boolean,
 *   loadingMore: boolean,
 *   error: string|null,
 *   hasMore: boolean,
 *   loadMore: () => Promise<void>,
 *   addComment: (commentData: Object) => Promise<Object>,
 *   toggleCommentVisibility: (commentId: string, targetStatus: "visible"|"hidden", commentRating: number) => Promise<Object>,
 *   reload: () => Promise<void>
 * }}
 */
export function useComments(postId, options = {}) {
  const {
    initialLimit = 3,
    pageSize = 10,
    totalCount,
    postSlug,
    firestoreDb = db,
  } = options;

  const [comments, setComments] = useState([]);
  const [contentCount, setContentCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Pagination cursor: cached DocumentSnapshot of the last fetched comment
  const lastDocRef = useRef(null);
  // Cache of all loaded comments when fallback query is used (avoids needing composite index for pagination)
  const allFallbackDocsRef = useRef([]);
  // Keep track of active fetch execution to avoid race conditions
  const isMountedRef = useRef(true);

  /**
   * Evaluates if more comments remain to be fetched based on pre-aggregated totalCount
   * or page size comparison.
   */
  const evaluateHasMore = useCallback(
    (loadedTotal, batchSize, requestedLimit) => {
      if (totalCount !== undefined && totalCount !== null) {
        return loadedTotal < Number(totalCount);
      }
      return batchSize >= requestedLimit;
    },
    [totalCount]
  );

  /**
   * Tier 1: Initial Load (Strictly up to 3 comments) with multi-tier query fallbacks
   */
  const fetchInitialComments = useCallback(async () => {
    const candidateIds = Array.from(new Set([postId, postSlug].filter(Boolean)));

    if (candidateIds.length === 0 || !firestoreDb) {
      setComments([]);
      setLoading(false);
      setHasMore(false);
      lastDocRef.current = null;
      allFallbackDocsRef.current = [];
      return;
    }

    setLoading(true);
    setError(null);
    lastDocRef.current = null;
    allFallbackDocsRef.current = [];

    let loadedDocs = [];
    let usedFallback = false;

    // Step 1: Attempt primary optimized query (ordered by created_at desc)
    try {
      const q = buildInitialCommentsQuery(firestoreDb, postId || candidateIds[0], initialLimit);
      const snap = await getDocs(q);
      if (snap && !snap.empty) {
        loadedDocs = snap.docs || [];
      } else if (postSlug && postSlug !== postId) {
        // Try slug with primary query if postId yielded no results
        try {
          const slugQ = buildInitialCommentsQuery(firestoreDb, postSlug, initialLimit);
          const slugSnap = await getDocs(slugQ);
          if (slugSnap && !slugSnap.empty) {
            loadedDocs = slugSnap.docs || [];
          }
        } catch {
          usedFallback = true;
        }
      }
    } catch (primaryErr) {
      console.warn(
        `Primary ordered comments query failed for post "${postId || postSlug}" (likely missing composite index in Firestore). Attempting resilient index-free fallback:`,
        primaryErr
      );
      usedFallback = true;
    }

    // Step 2: Resilient Fallback - query without orderBy to bypass missing composite index
    if (usedFallback || (loadedDocs.length === 0 && (Number(totalCount) > 0 || candidateIds.length > 1))) {
      try {
        const docMap = new Map();

        for (const candidateId of candidateIds) {
          try {
            const fallbackQ = buildFallbackCommentsQuery(firestoreDb, candidateId);
            const fallbackSnap = await getDocs(fallbackQ);
            (fallbackSnap.docs || []).forEach((d) => docMap.set(d.id, d));
          } catch (candErr) {
            console.warn(`Fallback query for candidate ID "${candidateId}" failed:`, candErr);
          }
        }

        const rawFallbackDocs = Array.from(docMap.values());
        // Only show comments that have non-empty written review content
        const contentDocs = rawFallbackDocs.filter((docSnap) => {
          const data = docSnap.data ? docSnap.data() : docSnap;
          return typeof data?.content === "string" && data.content.trim().length > 0;
        });

        setContentCount(contentDocs.length);

        if (rawFallbackDocs.length > 0) {
          // Sort client-side descending by created_at timestamp
          const itemsData = contentDocs.map((docSnap) => ({
            id: docSnap.id,
            _docSnap: docSnap,
            ...docSnap.data(),
          }));
          const sorted = sortCommentsByDate(itemsData);

          allFallbackDocsRef.current = sorted;
          const initialSlice = sorted.slice(0, initialLimit);

          if (!isMountedRef.current) return;

          setComments(initialSlice);
          setHasMore(sorted.length > initialLimit);
          lastDocRef.current = initialSlice[initialSlice.length - 1]?._docSnap || null;
          setError(null);
          setLoading(false);
          return;
        }
      } catch (fallbackErr) {
        console.error("Resilient comments query fallback also failed:", fallbackErr);
      }
    }

    if (!isMountedRef.current) return;

    if (loadedDocs.length === 0) {
      setComments([]);
      setContentCount(0);
      setHasMore(false);
      lastDocRef.current = null;
    } else {
      const docs = loadedDocs;
      lastDocRef.current = docs[docs.length - 1] || null;

      // Only show comments with non-empty written content
      const items = docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((c) => typeof c.content === "string" && c.content.trim().length > 0);

      setComments(items);
      setContentCount(items.length);
      setHasMore(evaluateHasMore(items.length, docs.length, initialLimit));
    }

    setLoading(false);
  }, [firestoreDb, postId, postSlug, initialLimit, evaluateHasMore, totalCount]);

  /**
   * Tier 2: Cursor-Based Pagination (Fetches next batch of 10 items)
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore || !firestoreDb) {
      return;
    }

    // Case A: If cached fallback docs exist in memory, paginate smoothly without index requirements
    if (allFallbackDocsRef.current && allFallbackDocsRef.current.length > 0) {
      const currentCount = comments.length;
      const nextSlice = allFallbackDocsRef.current.slice(
        currentCount,
        currentCount + pageSize
      );

      if (nextSlice.length > 0) {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueItems = nextSlice.filter((c) => !existingIds.has(c.id));
          const updated = [...prev, ...uniqueItems];
          setHasMore(updated.length < allFallbackDocsRef.current.length);
          return updated;
        });
      } else {
        setHasMore(false);
      }
      return;
    }

    // Case B: Cursor-based pagination with DocumentSnapshot
    if (!lastDocRef.current) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const q = buildPaginatedCommentsQuery(
        firestoreDb,
        postId || postSlug,
        lastDocRef.current,
        pageSize
      );
      const snap = await getDocs(q);

      if (!isMountedRef.current) return;

      if (!snap || snap.empty) {
        setHasMore(false);
      } else {
        const docs = snap.docs || [];
        lastDocRef.current = docs[docs.length - 1] || null;

        const newItems = docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((c) => typeof c.content === "string" && c.content.trim().length > 0);

        setComments((prev) => {
          // Deduplicate by ID in case an item was optimistically added
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueItems = newItems.filter((c) => !existingIds.has(c.id));
          const updated = [...prev, ...uniqueItems];

          setHasMore(evaluateHasMore(updated.length, docs.length, pageSize));
          return updated;
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Error paginating comments for post "${postId || postSlug}":`, err);
        setError(err.message || "Failed to load more comments.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [
    loadingMore,
    loading,
    hasMore,
    postId,
    postSlug,
    firestoreDb,
    pageSize,
    evaluateHasMore,
    comments.length,
  ]);

  /**
   * Creates a new comment atomically and optimistically prepends to local list
   */
  const addComment = useCallback(
    async (commentPayload) => {
      if (!firestoreDb || (!postId && !postSlug)) {
        throw new Error("Cannot submit comment without active post context.");
      }

      setError(null);
      const payloadWithPost = {
        ...commentPayload,
        post_id: postId || postSlug,
        post_slug: postSlug || "",
      };

      try {
        const created = await createCommentWithAggregate(
          firestoreDb,
          payloadWithPost
        );
        if (isMountedRef.current) {
          const hasContent = typeof created.content === "string" && created.content.trim().length > 0;
          if (hasContent) {
            setComments((prev) => [created, ...prev]);
            if (allFallbackDocsRef.current && allFallbackDocsRef.current.length > 0) {
              allFallbackDocsRef.current = [created, ...allFallbackDocsRef.current];
            }
          }
        }
        return created;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || "Failed to submit comment.");
        }
        throw err;
      }
    },
    [firestoreDb, postId, postSlug]
  );

  /**
   * Toggles visibility of a comment and updates local list
   */
  const toggleCommentVisibility = useCallback(
    async (commentId, targetStatus, commentRating) => {
      if (!firestoreDb || !postId) {
        throw new Error(
          "Cannot update comment visibility without active post context."
        );
      }

      setError(null);
      try {
        const result = await toggleCommentVisibilityWithAggregate(
          firestoreDb,
          commentId,
          postId,
          targetStatus,
          commentRating
        );

        if (isMountedRef.current) {
          if (targetStatus === "hidden") {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } else {
            setComments((prev) =>
              prev.map((c) =>
                c.id === commentId ? { ...c, status: "visible" } : c
              )
            );
          }
        }
        return result;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || "Failed to update comment status.");
        }
        throw err;
      }
    },
    [firestoreDb, postId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchInitialComments();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchInitialComments]);

  return {
    comments,
    contentCount,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    addComment,
    toggleCommentVisibility,
    reload: fetchInitialComments,
  };
}

export default useComments;
