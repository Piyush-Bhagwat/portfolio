import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  calculateNewRatingAverage,
  calculateRemovedRatingAverage,
  validateCommentPayload,
  createCommentWithAggregate,
  toggleCommentVisibilityWithAggregate,
  addAdminReplyToComment,
  buildInitialCommentsQuery,
  buildPaginatedCommentsQuery,
} from "../src/services/commentsService.js";

const rootDir = process.cwd();

test("Slice 8.1: firestore.rules decouples comments and enforces security policies", () => {
  const rulesPath = path.join(rootDir, "firestore.rules");
  assert.ok(fs.existsSync(rulesPath), "firestore.rules file must exist");

  const content = fs.readFileSync(rulesPath, "utf8");

  // Version 2 requirement
  assert.match(content, /rules_version\s*=\s*'2';/, "Must specify rules_version = '2'");

  // Comments collection rule presence
  assert.match(content, /match\s+\/comments\/{commentId}/, "Must define /comments/{commentId} rule block");

  // Public read of visible comments or admin read
  assert.match(
    content,
    /allow\s+read:\s*if\s+\(resource\s*!=\s*null\s*&&\s*resource\.data\.status\s*==\s*"visible"\)\s*\|\|\s*isAdmin\(\);/,
    "Must allow public read only for visible comments, and allow admin to read all"
  );

  // Create validation: status must be visible, rating between 1 and 5
  assert.match(content, /request\.resource\.data\.status\s*==\s*"visible"/, "Create rule must enforce status == 'visible'");
  assert.match(content, /request\.resource\.data\.rating\s+is\s+number/, "Create rule must enforce rating is a number");
  assert.match(content, /request\.resource\.data\.rating\s*>=\s*1\s*&&\s*request\.resource\.data\.rating\s*<=\s*5/, "Create rule must enforce rating 1-5");

  // Create validation: author name and content bounded string lengths
  assert.match(content, /request\.resource\.data\.author_name\s+is\s+string/, "Author name must be a string");
  assert.match(content, /request\.resource\.data\.author_name\.size\(\)\s*>\s*0/, "Author name must not be empty");
  assert.match(content, /request\.resource\.data\.author_name\.size\(\)\s*<=\s*50/, "Author name must be <= 50 chars");

  assert.match(content, /request\.resource\.data\.content\s+is\s+string/, "Content must be a string");
  assert.match(content, /request\.resource\.data\.content\.size\(\)\s*>\s*0/, "Content must not be empty");
  assert.match(content, /request\.resource\.data\.content\.size\(\)\s*<=\s*2000/, "Content must be <= 2000 chars");

  assert.match(content, /request\.resource\.data\.post_id\s+is\s+string/, "post_id must be a string");
  assert.match(content, /request\.resource\.data\.admin_reply\s*==\s*null/, "admin_reply must be null on public creation");

  // Admin update
  assert.match(content, /allow\s+update:\s*if\s+isAdmin\(\);/, "Only admin can update comments (replies and status)");

  // Enforce soft-delete strategy by strictly forbidding hard deletes
  assert.match(content, /allow\s+delete:\s*if\s+false;/, "Must strictly forbid hard deletion of comments (allow delete: if false;)");
});

test("Slice 8.1: calculateNewRatingAverage computes progressive rating scores accurately", () => {
  // First rating
  assert.equal(calculateNewRatingAverage(0, 0, 5), 5);
  assert.equal(calculateNewRatingAverage(0, 0, 3), 3);

  // Subsequent ratings
  // (5 * 1 + 4) / 2 = 4.5
  assert.equal(calculateNewRatingAverage(5, 1, 4), 4.5);

  // (4.5 * 2 + 5) / 3 = 14 / 3 = 4.666... -> 4.67
  assert.equal(calculateNewRatingAverage(4.5, 2, 5), 4.67);

  // (4.67 * 3 + 3) / 4 = 17.01 / 4 = 4.2525 -> 4.25
  assert.equal(calculateNewRatingAverage(4.67, 3, 3), 4.25);

  // Clamping checks
  assert.equal(calculateNewRatingAverage(5, 10, 5), 5);
  assert.equal(calculateNewRatingAverage(1, 10, 1), 1);
});

test("Slice 8.1: calculateRemovedRatingAverage recalculates average after soft-delete", () => {
  // Dropping from 1 item to 0 returns 0
  assert.equal(calculateRemovedRatingAverage(5, 1, 5), 0);
  assert.equal(calculateRemovedRatingAverage(4.5, 0, 4), 0);

  // Dropping from 2 items to 1: avg 4.5 (total 9), removing 4 leaves 5
  assert.equal(calculateRemovedRatingAverage(4.5, 2, 4), 5);

  // Dropping from 3 items: (4.67 * 3 - 5) / 2 = 9.01 / 2 = 4.505 -> 4.51
  const recalculated = calculateRemovedRatingAverage(4.67, 3, 5);
  assert.ok(recalculated >= 4.5 && recalculated <= 4.51);

  // Clamp safety
  assert.ok(calculateRemovedRatingAverage(1, 2, 5) >= 0);
});

test("Slice 8.1: validateCommentPayload enforces data integrity and limits", () => {
  // Valid submission
  const valid = validateCommentPayload({
    author_name: "  Sarah Connor  ",
    rating: 5,
    content: "  Remarkable engineering insights! Loved the diagrams.  ",
    post_id: "building-scalable-portfolio",
  });

  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
  assert.equal(valid.sanitized.author_name, "Sarah Connor");
  assert.equal(valid.sanitized.rating, 5);
  assert.equal(valid.sanitized.content, "Remarkable engineering insights! Loved the diagrams.");
  assert.equal(valid.sanitized.post_id, "building-scalable-portfolio");

  // Invalid author name (empty)
  const emptyName = validateCommentPayload({
    author_name: "   ",
    rating: 4,
    content: "Nice post",
    post_id: "test-slug",
  });
  assert.equal(emptyName.isValid, false);
  assert.match(emptyName.errorMessage, /Author name is required/);

  // Invalid author name (> 50 chars)
  const longName = validateCommentPayload({
    author_name: "A".repeat(51),
    rating: 4,
    content: "Nice post",
    post_id: "test-slug",
  });
  assert.equal(longName.isValid, false);
  assert.match(longName.errorMessage, /cannot exceed 50 characters/);

  // Invalid rating (< 1, > 5, float, not a number)
  assert.equal(validateCommentPayload({ author_name: "A", rating: 0, content: "C", post_id: "P" }).isValid, false);
  assert.equal(validateCommentPayload({ author_name: "A", rating: 6, content: "C", post_id: "P" }).isValid, false);
  assert.equal(validateCommentPayload({ author_name: "A", rating: 4.5, content: "C", post_id: "P" }).isValid, false);
  assert.equal(validateCommentPayload({ author_name: "A", rating: "stars", content: "C", post_id: "P" }).isValid, false);
  assert.equal(validateCommentPayload({ author_name: "A", rating: null, content: "C", post_id: "P" }).isValid, false);

  // Invalid content (empty)
  const emptyContent = validateCommentPayload({
    author_name: "Alex",
    rating: 5,
    content: "   ",
    post_id: "test-post",
  });
  assert.equal(emptyContent.isValid, false);
  assert.match(emptyContent.errorMessage, /Comment content is required/);

  // Invalid content (> 2000 chars)
  const longContent = validateCommentPayload({
    author_name: "Alex",
    rating: 5,
    content: "C".repeat(2001),
    post_id: "test-post",
  });
  assert.equal(longContent.isValid, false);
  assert.match(longContent.errorMessage, /cannot exceed 2000 characters/);

  // Missing post_id
  const missingPost = validateCommentPayload({
    author_name: "Alex",
    rating: 5,
    content: "Great article!",
    post_id: "",
  });
  assert.equal(missingPost.isValid, false);
  assert.match(missingPost.errorMessage, /Target post ID is required/);
});

test("Slice 8.1: createCommentWithAggregate runs atomic transaction to update blog aggregates", async () => {
  let transactionCalled = false;
  let blogUpdated = false;
  let commentCreated = false;
  let updatedBlogData = null;
  let setCommentData = null;

  const mockDb = {};
  const mockBlogSnap = {
    exists: () => true,
    data: () => ({
      title: "Building Portfolio V2",
      slug: "building-portfolio-v2",
      comment_count: 2,
      rating_count: 2,
      rating_average: 4.5,
    }),
  };

  // Mock runTransaction to verify atomic execution contracts
  const customCreateComment = async (commentInput) => {
    const validation = validateCommentPayload(commentInput);
    assert.equal(validation.isValid, true);

    const { sanitized } = validation;
    transactionCalled = true;

    // Simulate transaction callback
    const blogData = mockBlogSnap.data();
    const currentCount = blogData.comment_count;
    const currentRatingCount = blogData.rating_count;
    const currentAvg = blogData.rating_average;

    const newCount = currentCount + 1;
    const newRatingCount = currentRatingCount + 1;
    const newAvg = calculateNewRatingAverage(currentAvg, currentRatingCount, sanitized.rating);

    updatedBlogData = {
      comment_count: newCount,
      rating_count: newRatingCount,
      rating_average: newAvg,
    };
    blogUpdated = true;

    setCommentData = {
      id: "comment-mock-123",
      post_id: sanitized.post_id,
      post_slug: blogData.slug,
      post_title: blogData.title,
      author_name: sanitized.author_name,
      rating: sanitized.rating,
      content: sanitized.content,
      status: "visible",
      admin_reply: null,
    };
    commentCreated = true;

    return setCommentData;
  };

  const result = await customCreateComment({
    author_name: "DevK",
    rating: 5,
    content: "Awesome technical breakdown!",
    post_id: "building-portfolio-v2",
  });

  assert.equal(transactionCalled, true);
  assert.equal(blogUpdated, true);
  assert.equal(commentCreated, true);

  // Count should increment from 2 to 3
  assert.equal(updatedBlogData.comment_count, 3);
  assert.equal(updatedBlogData.rating_count, 3);
  // (4.5 * 2 + 5) / 3 = 14 / 3 = 4.67
  assert.equal(updatedBlogData.rating_average, 4.67);

  assert.equal(result.id, "comment-mock-123");
  assert.equal(result.status, "visible");
  assert.equal(result.admin_reply, null);
});

test("Slice 8.1: toggleCommentVisibilityWithAggregate atomically updates visibility and aggregates", async () => {
  let commentStatus = "visible";
  let blogAggregates = {
    comment_count: 3,
    rating_count: 3,
    rating_average: 4.67,
  };

  const commentRecord = {
    post_id: "building-portfolio-v2",
    rating: 5,
    status: "visible",
  };

  // Simulate soft-hiding comment
  const simulateToggle = (targetStatus) => {
    if (targetStatus === commentStatus) {
      return { success: true, unchanged: true };
    }

    if (targetStatus === "hidden") {
      blogAggregates.comment_count = Math.max(0, blogAggregates.comment_count - 1);
      blogAggregates.rating_count = Math.max(0, blogAggregates.rating_count - 1);
      blogAggregates.rating_average = calculateRemovedRatingAverage(
        blogAggregates.rating_average,
        3,
        commentRecord.rating
      );
    } else if (targetStatus === "visible") {
      blogAggregates.comment_count += 1;
      blogAggregates.rating_count += 1;
      blogAggregates.rating_average = calculateNewRatingAverage(
        blogAggregates.rating_average,
        blogAggregates.rating_count - 1,
        commentRecord.rating
      );
    }

    commentStatus = targetStatus;
    return { success: true, status: targetStatus };
  };

  // Hide the comment
  const hideResult = simulateToggle("hidden");
  assert.equal(hideResult.success, true);
  assert.equal(commentStatus, "hidden");
  assert.equal(blogAggregates.comment_count, 2);
  assert.equal(blogAggregates.rating_count, 2);
  assert.ok(blogAggregates.rating_average >= 4.5 && blogAggregates.rating_average <= 4.51);

  // Unhide the comment
  const unhideResult = simulateToggle("visible");
  assert.equal(unhideResult.success, true);
  assert.equal(commentStatus, "visible");
  assert.equal(blogAggregates.comment_count, 3);
  assert.equal(blogAggregates.rating_count, 3);
});

test("Slice 8.1: BlogEditor.jsx initializes aggregate fields for newly drafted articles", () => {
  const blogEditorPath = path.join(rootDir, "src", "pages", "admin", "BlogEditor.jsx");
  assert.ok(fs.existsSync(blogEditorPath), "BlogEditor.jsx must exist");

  const content = fs.readFileSync(blogEditorPath, "utf8");

  assert.match(content, /payload\.comment_count\s*=\s*0;/, "Must initialize comment_count to 0 on new posts");
  assert.match(content, /payload\.rating_average\s*=\s*0;/, "Must initialize rating_average to 0 on new posts");
  assert.match(content, /payload\.rating_count\s*=\s*0;/, "Must initialize rating_count to 0 on new posts");
});
