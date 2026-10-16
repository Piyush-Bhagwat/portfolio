import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RatingStars from "../src/components/blog/RatingStars.jsx";
import CommentForm from "../src/components/blog/CommentForm.jsx";
import CommentBox from "../src/components/blog/CommentBox.jsx";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";
import { calculateNewRatingAverage } from "../src/services/commentsService.js";

test("Slice 8.5: RatingStars renders display-only mode with accessible attributes", () => {
  const html = renderToString(
    React.createElement(RatingStars, { rating: 4.8, interactive: false, size: "md" })
  );

  assert.ok(html.includes("role=\"img\""), "Display-only mode must use role='img'");
  assert.ok(
    html.includes("aria-label=\"Rating: 4.8 out of 5 stars\""),
    "Must include descriptive rating aria-label"
  );
  assert.ok(!html.includes("<button"), "Display-only mode must not render interactive buttons");
});

test("Slice 8.5: RatingStars renders interactive mode with radio buttons and descriptive labels", () => {
  const html = renderToString(
    React.createElement(RatingStars, {
      rating: 5,
      interactive: true,
      size: "lg",
      showLabel: true,
      onChange: () => {},
    })
  );

  assert.ok(html.includes("role=\"radiogroup\""), "Interactive mode must use role='radiogroup'");
  assert.ok(html.includes("role=\"radio\""), "Stars must have role='radio'");
  assert.ok(html.includes("aria-label=\"5 of 5 stars\""), "Must have accessible star aria-labels");
  assert.ok(html.includes("5 / 5 - Exceptional"), "Must render descriptive rating label");
  assert.ok(html.includes("w-5 h-5"), "Size lg must render w-5 h-5 star icons");
});

test("Slice 8.5: CommentForm renders all required fields, character counters, and submit button", () => {
  const html = renderToString(
    React.createElement(CommentForm, {
      postId: "test-blog-post",
      onSubmit: async () => {},
      onCancel: () => {},
    })
  );

  // Field labels and markers
  assert.ok(html.includes("Leave a Review &amp; Comment") || html.includes("Leave a Review & Comment"), "Must render form title");
  assert.ok(html.includes("Your Rating"), "Must render Rating field label");
  assert.ok(html.includes("Author Name / Handle"), "Must render Author Name field label");
  assert.ok(html.includes("Discussion / Review Content"), "Must render Content field label");

  // Inputs and length constraints
  assert.ok(html.includes("id=\"comment-author-name\""), "Must render author name input");
  assert.ok(
    html.includes("maxLength=\"50\"") || html.includes("maxlength=\"50\""),
    "Author name must enforce maxLength 50"
  );
  assert.ok(
    html.includes("0/50") || html.includes("0<!-- -->/50"),
    "Must render author name counter"
  );

  assert.ok(html.includes("id=\"comment-content\""), "Must render content textarea");
  assert.ok(
    html.includes("maxLength=\"2000\"") || html.includes("maxlength=\"2000\""),
    "Content must enforce maxLength 2000"
  );
  assert.ok(
    html.includes("0/2000") || html.includes("0<!-- -->/2000"),
    "Must render content character counter"
  );

  // Tactile Neo-Brutalist buttons
  assert.ok(html.includes("Publish Review"), "Must render submit button label");
  assert.ok(html.includes("Cancel"), "Must render cancel button");
  assert.ok(
    html.includes("active:translate-x-[2px]") && html.includes("active:translate-y-[2px]"),
    "Submit button must include tactile active press offsets"
  );
});

test("Slice 8.5: CommentBox renders inline CommentForm when formOpen is true", () => {
  const html = renderToString(
    React.createElement(CommentBox, {
      post: {
        id: "test-post-1",
        title: "Test Post",
        rating_average: 4.5,
        rating_count: 4,
        comment_count: 4,
      },
      formOpen: true,
      onAddComment: async () => {},
    })
  );

  // Form should be rendered inline instead of the initial "Leave a Review / Comment" trigger
  assert.ok(html.includes("id=\"comment-author-name\""), "CommentForm author input must be rendered");
  assert.ok(html.includes("id=\"comment-content\""), "CommentForm content textarea must be rendered");
  assert.ok(html.includes("Publish Review"), "CommentForm submit button must be rendered");
});

test("Slice 8.5: Optimistic parent post aggregate calculation updates correctly", () => {
  const currentPost = {
    id: "sample-post",
    comment_count: 5,
    rating_count: 5,
    rating_average: 4.6,
  };

  const newComment = {
    rating: 5,
    author_name: "Alex Dev",
    content: "Loved the Neo-Brutalism tips!",
  };

  // Run calculation logic matching handleCommentAdded in BlogPostPage
  const oldAvg = Number(currentPost.rating_average) || 0;
  const oldCount = Number(currentPost.rating_count) || 0;
  const newRatingCount = oldCount + 1;
  const newAvg = calculateNewRatingAverage(oldAvg, oldCount, newComment.rating);

  const updatedPost = {
    ...currentPost,
    comment_count: currentPost.comment_count + 1,
    rating_count: newRatingCount,
    rating_average: newAvg,
  };

  assert.equal(updatedPost.comment_count, 6, "comment_count must increment by 1");
  assert.equal(updatedPost.rating_count, 6, "rating_count must increment by 1");
  // (4.6 * 5 + 5) / 6 = 28 / 6 = 4.67
  assert.equal(updatedPost.rating_average, 4.67, "rating_average must recalculate accurately");
});

test("Slice 8.5: BlogPostPage integrates CommentBox with review submission trigger", () => {
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

  assert.ok(html.includes("Leave a Review / Comment"), "BlogPostPage sidebar must render review submission trigger");
  assert.ok(html.includes("id=\"comments-section\""), "Must include comments-section anchor target");
});
