import {
  collection,
  doc,
  setDoc,
  runTransaction,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

/**
 * Calculates the updated floating rating average when a new rating is submitted.
 * Formula: ((currentAvg * currentCount) + newRating) / (currentCount + 1)
 *
 * @param {number} currentAverage - Existing average score (e.g. 4.5)
 * @param {number} currentCount - Total number of ratings already included
 * @param {number} newRating - New rating being submitted (1 to 5)
 * @returns {number} Updated average rounded to 2 decimal places
 */
export const calculateNewRatingAverage = (currentAverage = 0, currentCount = 0, newRating = 5) => {
  const avg = Number(currentAverage) || 0;
  const count = Number(currentCount) || 0;
  const rating = Number(newRating);

  if (count <= 0) {
    const clamped = Math.max(1, Math.min(5, rating));
    return Number(clamped.toFixed(2));
  }

  const totalScore = (avg * count) + rating;
  const newCount = count + 1;
  const rawAvg = totalScore / newCount;
  const clamped = Math.max(1, Math.min(5, rawAvg));
  return Number(clamped.toFixed(2));
};

/**
 * Calculates the updated floating rating average when a rating is removed (e.g. soft-hidden).
 * Formula: ((currentAvg * currentCount) - removedRating) / (currentCount - 1)
 *
 * @param {number} currentAverage - Existing average score
 * @param {number} currentCount - Total number of ratings currently included
 * @param {number} removedRating - Rating of the comment being excluded
 * @returns {number} Updated average rounded to 2 decimal places (or 0 if count drops to 0)
 */
export const calculateRemovedRatingAverage = (currentAverage = 0, currentCount = 0, removedRating = 5) => {
  const avg = Number(currentAverage) || 0;
  const count = Number(currentCount) || 0;
  const rating = Number(removedRating);

  if (count <= 1) {
    return 0;
  }

  const totalScore = (avg * count) - rating;
  const newCount = count - 1;
  const rawAvg = totalScore / newCount;
  const clamped = Math.max(0, Math.min(5, rawAvg));
  return Number(clamped.toFixed(2));
};

/**
 * Validates public comment submission input against security and formatting constraints.
 *
 * @param {Object} data
 * @param {string} data.author_name - Display name (1-50 chars)
 * @param {number} data.rating - Integer rating (1-5)
 * @param {string} data.content - Comment body (1-2000 chars)
 * @param {string} data.post_id - Target blog post identifier
 * @returns {{ isValid: boolean, errors: string[], errorMessage: string, sanitized: Object | null }}
 */
export const validateCommentPayload = (data = {}) => {
  const errors = [];
  const { author_name, rating, content, post_id } = data;

  if (!author_name || typeof author_name !== "string" || !author_name.trim()) {
    errors.push("Author name is required.");
  } else if (author_name.trim().length > 50) {
    errors.push("Author name cannot exceed 50 characters.");
  }

  const numericRating = Number(rating);
  if (
    rating === undefined ||
    rating === null ||
    isNaN(numericRating) ||
    numericRating < 1 ||
    numericRating > 5 ||
    !Number.isInteger(numericRating)
  ) {
    errors.push("Rating must be an integer between 1 and 5.");
  }

  // Review content is optional (0-2000 characters)
  const sanitizedContent = typeof content === "string" ? content.trim() : "";
  if (sanitizedContent.length > 2000) {
    errors.push("Comment content cannot exceed 2000 characters.");
  }

  if (!post_id || typeof post_id !== "string" || !post_id.trim()) {
    errors.push("Target post ID is required.");
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    errorMessage: errors.join(" "),
    sanitized: isValid
      ? {
          author_name: author_name.trim(),
          rating: numericRating,
          content: sanitizedContent,
          post_id: post_id.trim(),
        }
      : null,
  };
};

/**
 * Atomically creates a comment in the top-level `comments` collection and updates
 * denormalized aggregates (`comment_count`, `rating_count`, `rating_average`) on the parent blog post.
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb - Firestore instance
 * @param {Object} commentInput - Raw comment submission
 * @returns {Promise<Object>} Created comment object including generated document ID
 */
export const createCommentWithAggregate = async (firestoreDb, commentInput) => {
  const validation = validateCommentPayload(commentInput);
  if (!validation.isValid) {
    const error = new Error(validation.errorMessage);
    error.validationErrors = validation.errors;
    throw error;
  }

  const { sanitized } = validation;

  try {
    return await runTransaction(firestoreDb, async (transaction) => {
      const blogRef = doc(firestoreDb, "blogs", sanitized.post_id);
      const blogSnap = await transaction.get(blogRef);

      const blogData = blogSnap.exists() ? blogSnap.data() : {};
      const currentCount = Number(blogData.comment_count) || 0;
      const currentRatingCount = Number(blogData.rating_count) || 0;
      const currentAvg = Number(blogData.rating_average) || 0;

      const newCount = currentCount + 1;
      const newRatingCount = currentRatingCount + 1;
      const newRatingAvg = calculateNewRatingAverage(currentAvg, currentRatingCount, sanitized.rating);

      // 1. Update parent blog post aggregates
      if (blogSnap.exists()) {
        transaction.update(blogRef, {
          comment_count: newCount,
          rating_count: newRatingCount,
          rating_average: newRatingAvg,
          updated_at: serverTimestamp(),
        });
      }

      // 2. Insert comment document into decoupled top-level collection
      const commentCol = collection(firestoreDb, "comments");
      const commentRef = doc(commentCol);

      const commentPayload = {
        post_id: sanitized.post_id,
        post_slug: blogData.slug || commentInput.post_slug || "",
        post_title: blogData.title || commentInput.post_title || "",
        author_name: sanitized.author_name,
        rating: sanitized.rating,
        content: sanitized.content || "",
        status: "visible",
        admin_reply: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      transaction.set(commentRef, commentPayload);

      return {
        id: commentRef.id,
        ...commentPayload,
      };
    });
  } catch (err) {
    // If updating parent blog document aggregates fails (e.g. unauthenticated reader without blog write permissions),
    // write directly to comments collection so the visitor review is safely preserved
    console.warn("Aggregate transaction update failed; saving comment document directly:", err);
    const commentCol = collection(firestoreDb, "comments");
    const commentRef = doc(commentCol);

    const fallbackPayload = {
      post_id: sanitized.post_id,
      post_slug: commentInput.post_slug || "",
      post_title: commentInput.post_title || "",
      author_name: sanitized.author_name,
      rating: sanitized.rating,
      content: sanitized.content || "",
      status: "visible",
      admin_reply: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    await setDoc(commentRef, fallbackPayload);

    return {
      id: commentRef.id,
      ...fallbackPayload,
    };
  }
};

/**
 * Atomically toggles comment visibility between 'visible' and 'hidden' (soft delete),
 * updating denormalized aggregates on the parent blog post document.
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb - Firestore instance
 * @param {string} commentId - Target comment document ID
 * @param {"visible" | "hidden"} targetStatus - New visibility state
 * @returns {Promise<{ success: boolean, commentId: string, status: string, unchanged?: boolean }>}
 */
export const toggleCommentVisibilityWithAggregate = async (firestoreDb, commentId, targetStatus) => {
  if (targetStatus !== "visible" && targetStatus !== "hidden") {
    throw new Error('Target status must be either "visible" or "hidden".');
  }

  return await runTransaction(firestoreDb, async (transaction) => {
    const commentRef = doc(firestoreDb, "comments", commentId);
    const commentSnap = await transaction.get(commentRef);

    if (!commentSnap.exists()) {
      throw new Error(`Comment with ID "${commentId}" not found.`);
    }

    const commentData = commentSnap.data();
    if (commentData.status === targetStatus) {
      return { success: true, commentId, status: targetStatus, unchanged: true };
    }

    const blogRef = doc(firestoreDb, "blogs", commentData.post_id);
    const blogSnap = await transaction.get(blogRef);

    if (blogSnap.exists()) {
      const blogData = blogSnap.data();
      const currentCount = Number(blogData.comment_count) || 0;
      const currentRatingCount = Number(blogData.rating_count) || 0;
      const currentAvg = Number(blogData.rating_average) || 0;

      let newCount = currentCount;
      let newRatingCount = currentRatingCount;
      let newAvg = currentAvg;

      if (targetStatus === "hidden") {
        newCount = Math.max(0, currentCount - 1);
        newRatingCount = Math.max(0, currentRatingCount - 1);
        newAvg = calculateRemovedRatingAverage(currentAvg, currentRatingCount, commentData.rating);
      } else if (targetStatus === "visible") {
        newCount = currentCount + 1;
        newRatingCount = currentRatingCount + 1;
        newAvg = calculateNewRatingAverage(currentAvg, currentRatingCount, commentData.rating);
      }

      transaction.update(blogRef, {
        comment_count: newCount,
        rating_count: newRatingCount,
        rating_average: newAvg,
        updated_at: serverTimestamp(),
      });
    }

    transaction.update(commentRef, {
      status: targetStatus,
      updated_at: serverTimestamp(),
    });

    return {
      success: true,
      commentId,
      status: targetStatus,
    };
  });
};

/**
 * Attaches or updates an official author response on a comment.
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb - Firestore instance
 * @param {string} commentId - Target comment document ID
 * @param {string} replyContent - Response text written by author
 * @param {string} [authorName="Piyush Bhagwat"] - Author display name
 * @returns {Promise<void>}
 */
export const addAdminReplyToComment = async (
  firestoreDb,
  commentId,
  replyContent,
  authorName = "Piyush Bhagwat"
) => {
  if (!replyContent || typeof replyContent !== "string" || !replyContent.trim()) {
    throw new Error("Reply content cannot be empty.");
  }

  const commentRef = doc(firestoreDb, "comments", commentId);
  await updateDoc(commentRef, {
    admin_reply: {
      content: replyContent.trim(),
      replied_at: serverTimestamp(),
      author: authorName.trim(),
    },
    updated_at: serverTimestamp(),
  });
};

/**
 * Constructs the Firestore query for initial blog reader comment loading (strictly 3 items).
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb
 * @param {string} postId - Blog post ID
 * @param {number} [limitCount=3] - Initial fetch limit
 */
export const buildInitialCommentsQuery = (firestoreDb, postId, limitCount = 3) => {
  return query(
    collection(firestoreDb, "comments"),
    where("post_id", "==", postId),
    where("status", "==", "visible"),
    orderBy("created_at", "desc"),
    limit(limitCount)
  );
};

/**
 * Constructs the cursor-paginated Firestore query for expanding comments (fetching next 10).
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb
 * @param {string} postId - Blog post ID
 * @param {import("firebase/firestore").DocumentSnapshot} lastDocSnapshot - Pagination cursor
 * @param {number} [pageSize=10] - Number of items to fetch
 */
export const buildPaginatedCommentsQuery = (firestoreDb, postId, lastDocSnapshot, pageSize = 10) => {
  if (!lastDocSnapshot) {
    return buildInitialCommentsQuery(firestoreDb, postId, pageSize);
  }

  return query(
    collection(firestoreDb, "comments"),
    where("post_id", "==", postId),
    where("status", "==", "visible"),
    orderBy("created_at", "desc"),
    startAfter(lastDocSnapshot),
    limit(pageSize)
  );
};

export default {
  calculateNewRatingAverage,
  calculateRemovedRatingAverage,
  validateCommentPayload,
  createCommentWithAggregate,
  toggleCommentVisibilityWithAggregate,
  addAdminReplyToComment,
  buildInitialCommentsQuery,
  buildPaginatedCommentsQuery,
};
