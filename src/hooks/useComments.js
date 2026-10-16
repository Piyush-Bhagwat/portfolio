import { useState, useEffect, useRef, useCallback } from "react";
import { getDocs } from "firebase/firestore";
import { db } from "../services/firebase.js";
import {
  buildInitialCommentsQuery,
  buildPaginatedCommentsQuery,
  createCommentWithAggregate,
  toggleCommentVisibilityWithAggregate,
} from "../services/commentsService.js";

/**
 * useComments - Progressive Loading & Cursor-Based Pagination Hook
 *
 * Provides a scalable, decoupled community interaction pipeline for blog posts.
 * - Initial Tier 1 load: Strictly 3 visible comments.
 * - Cursor Pagination Tier 2: Fetches next 10 items on demand via startAfter(lastDocRef).
 * - Bounded memory & bandwidth: Guarantees minimal Firestore quota consumption even on viral posts.
 *
 * @param {string} postId - Target blog post identifier
 * @param {Object} [options={}] - Optional configuration
 * @param {number} [options.initialLimit=3] - Number of comments to load initially
 * @param {number} [options.pageSize=10] - Number of comments per paginated batch
 * @param {number} [options.totalCount] - Pre-aggregated comment_count from parent blog document
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
    firestoreDb = db,
  } = options;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Pagination cursor: cached DocumentSnapshot of the last fetched comment
  const lastDocRef = useRef(null);
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
   * Tier 1: Initial Load (Strictly up to 3 comments)
   */
  const fetchInitialComments = useCallback(async () => {
    if (!postId || !firestoreDb) {
      setComments([]);
      setLoading(false);
      setHasMore(false);
      lastDocRef.current = null;
      return;
    }

    setLoading(true);
    setError(null);
    lastDocRef.current = null;

    try {
      const q = buildInitialCommentsQuery(firestoreDb, postId, initialLimit);
      const snap = await getDocs(q);

      if (!isMountedRef.current) return;

      if (!snap || snap.empty) {
        setComments([]);
        setHasMore(false);
        lastDocRef.current = null;
      } else {
        const docs = snap.docs || [];
        lastDocRef.current = docs[docs.length - 1] || null;

        const items = docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setComments(items);
        setHasMore(evaluateHasMore(items.length, docs.length, initialLimit));
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Error loading comments for post "${postId}":`, err);
        setError(err.message || "Failed to load comments.");
        setComments([]);
        setHasMore(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [firestoreDb, postId, initialLimit, evaluateHasMore]);

  /**
   * Tier 2: Cursor-Based Pagination (Fetches next batch of 10 items)
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore || !postId || !firestoreDb) {
      return;
    }

    // If no cursor snapshot is available, fallback to initial reload
    if (!lastDocRef.current) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const q = buildPaginatedCommentsQuery(
        firestoreDb,
        postId,
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

        const newItems = docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

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
        console.error(`Error paginating comments for post "${postId}":`, err);
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
    firestoreDb,
    pageSize,
    evaluateHasMore,
  ]);

  /**
   * Creates a new comment atomically and optimistically prepends to local list
   */
  const addComment = useCallback(
    async (commentPayload) => {
      if (!firestoreDb || !postId) {
        throw new Error("Cannot submit comment without active post context.");
      }

      setError(null);
      const payloadWithPost = {
        ...commentPayload,
        post_id: postId,
      };

      try {
        const created = await createCommentWithAggregate(
          firestoreDb,
          payloadWithPost
        );
        if (isMountedRef.current) {
          setComments((prev) => [created, ...prev]);
        }
        return created;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || "Failed to submit comment.");
        }
        throw err;
      }
    },
    [firestoreDb, postId]
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
