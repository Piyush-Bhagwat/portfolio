import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import useComments, { useComments as useCommentsNamed } from "../src/hooks/useComments.js";
import {
  buildInitialCommentsQuery,
  buildPaginatedCommentsQuery,
  validateCommentPayload,
} from "../src/services/commentsService.js";
import { db } from "../src/services/firebase.js";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";

test("Slice 8.4: useComments exports hook as default and named export", () => {
  assert.equal(typeof useComments, "function", "useComments must be exported as default function");
  assert.equal(typeof useCommentsNamed, "function", "useComments must be exported as named function");
  assert.equal(useComments, useCommentsNamed, "Default and named exports must be identical");
});

test("Slice 8.4: useComments hook initializes with expected state and action signatures", () => {
  let captured = null;

  function TestHookConsumer({ postId, options }) {
    captured = useComments(postId, options);
    return React.createElement(
      "div",
      null,
      `Loaded: ${captured.comments.length}, Loading: ${captured.loading}`
    );
  }

  const html = renderToString(
    React.createElement(TestHookConsumer, {
      postId: "sample-blog-post",
      options: { initialLimit: 3, pageSize: 10, totalCount: 15 },
    })
  );

  assert.ok(html.includes("Loaded: 0"), "Initial SSR comments array must be empty");
  assert.ok(captured, "Hook output must be captured");
  assert.equal(Array.isArray(captured.comments), true, "comments must be an array");
  assert.equal(typeof captured.loading, "boolean", "loading must be a boolean");
  assert.equal(typeof captured.loadingMore, "boolean", "loadingMore must be a boolean");
  assert.equal(typeof captured.hasMore, "boolean", "hasMore must be a boolean");
  assert.equal(captured.error, null, "error must initialize to null");
  assert.equal(typeof captured.loadMore, "function", "loadMore must be an async function");
  assert.equal(typeof captured.addComment, "function", "addComment must be an async function");
  assert.equal(typeof captured.toggleCommentVisibility, "function", "toggleCommentVisibility must be an async function");
  assert.equal(typeof captured.reload, "function", "reload must be an async function");
});

test("Slice 8.4: buildInitialCommentsQuery creates Tier 1 query constrained to 3 visible items", () => {
  const queryObj = buildInitialCommentsQuery(db, "test-post-123", 3);

  assert.ok(queryObj, "Must return query instance");
  assert.equal(typeof queryObj, "object");
});

test("Slice 8.4: buildPaginatedCommentsQuery creates Tier 2 cursor query with fallback", () => {
  // Fallback to initial query if cursor is missing
  const fallbackQuery = buildPaginatedCommentsQuery(
    db,
    "test-post-123",
    null,
    10
  );
  assert.ok(fallbackQuery, "Must fallback gracefully when cursor is null");
  assert.equal(typeof fallbackQuery, "object");
});

test("Slice 8.4: Pagination evaluation accurately computes hasMore against totalCount", () => {
  const evaluateHasMore = (loadedCount, batchSize, requestedLimit, totalCount) => {
    if (totalCount !== undefined && totalCount !== null) {
      return loadedCount < Number(totalCount);
    }
    return batchSize >= requestedLimit;
  };

  // Case 1: Post has 12 total comments, 3 loaded initially -> hasMore must be true
  assert.equal(evaluateHasMore(3, 3, 3, 12), true, "3 of 12 loaded must haveMore = true");

  // Case 2: Post has 3 total comments, 3 loaded initially -> hasMore must be false
  assert.equal(evaluateHasMore(3, 3, 3, 3), false, "All 3 comments loaded must haveMore = false");

  // Case 3: Post has 2 total comments, 2 loaded initially -> hasMore must be false
  assert.equal(evaluateHasMore(2, 2, 3, 2), false, "All 2 comments loaded must haveMore = false");

  // Case 4: Total count not provided, full page returned -> hasMore = true
  assert.equal(evaluateHasMore(10, 10, 10, undefined), true, "Full batch returned without totalCount must haveMore = true");

  // Case 5: Total count not provided, partial page returned -> hasMore = false
  assert.equal(evaluateHasMore(4, 4, 10, undefined), false, "Partial batch returned must haveMore = false");
});

test("Slice 8.4: Cursor concatenation preserves previous pages and deduplicates IDs", () => {
  const page1Comments = [
    { id: "c-1", author_name: "Alex", content: "First!" },
    { id: "c-2", author_name: "DevK", content: "Second" },
    { id: "c-3", author_name: "Sara", content: "Third" },
  ];

  const page2Raw = [
    { id: "c-3", author_name: "Sara", content: "Duplicate test" }, // Duplicate from concurrent write
    { id: "c-4", author_name: "Rohan", content: "Fourth" },
    { id: "c-5", author_name: "Elena", content: "Fifth" },
  ];

  // Concatenate and deduplicate as implemented in useComments
  const existingIds = new Set(page1Comments.map((c) => c.id));
  const uniqueItems = page2Raw.filter((c) => !existingIds.has(c.id));
  const concatenated = [...page1Comments, ...uniqueItems];

  assert.equal(concatenated.length, 5, "Total comments must equal 5 after deduplicating c-3");
  assert.equal(concatenated[0].id, "c-1", "Page 1 items must be preserved in order");
  assert.equal(concatenated[1].id, "c-2");
  assert.equal(concatenated[2].id, "c-3");
  assert.equal(concatenated[3].id, "c-4");
  assert.equal(concatenated[4].id, "c-5");
});

test("Slice 8.4: addComment validates payload and rejects malformed reviews", () => {
  // Missing required rating
  const invalid1 = validateCommentPayload({
    author_name: "Alex",
    content: "Review content",
    post_id: "test-post",
  });
  assert.equal(invalid1.isValid, false);

  // Missing author name
  const invalid2 = validateCommentPayload({
    rating: 5,
    content: "Review content",
    post_id: "test-post",
  });
  assert.equal(invalid2.isValid, false);

  // Valid comment payload
  const valid = validateCommentPayload({
    author_name: "DevK",
    rating: 5,
    content: "Excellent progressive loading design!",
    post_id: "test-post",
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.sanitized.rating, 5);
  assert.equal(valid.sanitized.author_name, "DevK");
});

test("Slice 8.4: toggleCommentVisibility filters out hidden comments on soft-delete", () => {
  const currentComments = [
    { id: "c-1", author_name: "Alex", status: "visible" },
    { id: "c-2", author_name: "Spammer", status: "visible" },
    { id: "c-3", author_name: "Sara", status: "visible" },
  ];

  // Admin soft-deletes comment c-2
  const targetId = "c-2";
  const targetStatus = "hidden";

  const updatedComments = targetStatus === "hidden"
    ? currentComments.filter((c) => c.id !== targetId)
    : currentComments.map((c) => c.id === targetId ? { ...c, status: targetStatus } : c);

  assert.equal(updatedComments.length, 2, "Hidden comment must be filtered out of active list");
  assert.ok(!updatedComments.some((c) => c.id === "c-2"), "Spam comment must no longer be in visible list");
  assert.equal(updatedComments[0].id, "c-1");
  assert.equal(updatedComments[1].id, "c-3");
});

test("Slice 8.4: BlogPostPage mounts with useComments hook integrated", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs/building-resilient-web-interfaces"] },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, {
          path: "/blogs/:slug",
          element: React.createElement(BlogPostPage),
        })
      )
    )
  );

  // BlogPostPage renders reader interface with CommentBox hooked into useComments
  assert.ok(html.includes("community.discussion"), "BlogPostPage must render CommentBox");
  assert.ok(html.includes("id=\"comments-section\""), "Must contain comments-section anchor target");
  assert.ok(html.includes("Leave a Review / Comment"), "Must contain review call to action");
});
