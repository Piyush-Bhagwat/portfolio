import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BlogCard from "../src/components/blog/BlogCard.jsx";
import LatestBlogTile from "../src/components/home/LatestBlogTile.jsx";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";

const samplePostWithRatings = {
  id: "building-resilient-web-interfaces",
  title: "Building Resilient Web Interfaces with Neo-Brutalism",
  slug: "building-resilient-web-interfaces",
  excerpt: "A deep dive into tactile web design tokens.",
  read_time_minutes: 5,
  published: true,
  rating_average: 4.88,
  rating_count: 18,
  comment_count: 12,
  tags: ["React", "UI Engineering"],
  created_at: new Date("2026-02-15T10:00:00Z"),
};

const samplePostZeroRatings = {
  id: "zero-ratings-post",
  title: "Zero Ratings Post",
  slug: "zero-ratings-post",
  excerpt: "No reviews or comments yet.",
  read_time_minutes: 2,
  published: true,
  rating_average: 0,
  rating_count: 0,
  comment_count: 0,
  tags: ["Design"],
};

const samplePostSingleComment = {
  id: "single-comment-post",
  title: "Single Comment Post",
  slug: "single-comment-post",
  excerpt: "Exactly one comment here.",
  read_time_minutes: 3,
  published: true,
  rating_average: 5,
  rating_count: 1,
  comment_count: 1,
  tags: ["Testing"],
};

test("Slice 8.2: BlogCard renders rating score pill and comment counter pill with pre-aggregated data", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(BlogCard, { post: samplePostWithRatings })
    )
  );

  // Rating pill with 1 decimal and count
  assert.ok(html.includes("4.9 (18)"), "BlogCard must render rounded rating average and review count '4.9 (18)'");
  assert.ok(
    html.includes("Average Rating: 4.9 / 5 from 18 reviews"),
    "BlogCard must render informative tooltip title on rating pill"
  );

  // Comment count pill (plural)
  assert.ok(html.includes("12 comments"), "BlogCard must render plural '12 comments'");

  // Neo-Brutalist theme-aware surface fills
  assert.ok(html.includes("bg-[#e9f0ea]"), "Must include subtle sage light background '#e9f0ea'");
  assert.ok(html.includes("dark:bg-[#18181b]"), "Must include dark mode surface '#18181b'");
});

test("Slice 8.2: BlogCard renders defensive fallback 'New' and '0 comments' when unrated", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(BlogCard, { post: samplePostZeroRatings })
    )
  );

  assert.ok(html.includes("New"), "BlogCard must render 'New' badge when rating_count is 0");
  assert.ok(html.includes("No reviews yet"), "BlogCard must render 'No reviews yet' title");
  assert.ok(html.includes("0 comments"), "BlogCard must render '0 comments' when comment_count is 0");
});

test("Slice 8.2: BlogCard formats singular '1 comment' appropriately", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(BlogCard, { post: samplePostSingleComment })
    )
  );

  assert.ok(html.includes("1 comment"), "BlogCard must render singular '1 comment'");
  assert.ok(!html.includes("1 comments"), "BlogCard must not render '1 comments'");
  assert.ok(html.includes("5.0 (1)"), "BlogCard must render '5.0 (1)' for 1 review");
});

test("Slice 8.2: LatestBlogTile renders rating and comment badges on Bento grid", () => {
  const htmlWithRatings = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(LatestBlogTile, { post: samplePostWithRatings })
    )
  );

  assert.ok(htmlWithRatings.includes("4.9 (18)"), "LatestBlogTile must render rating score and count");
  assert.ok(htmlWithRatings.includes("12 comments"), "LatestBlogTile must render comment count");
  assert.ok(htmlWithRatings.includes("/blogs/building-resilient-web-interfaces"), "LatestBlogTile links to article");

  // Fallback test
  const htmlZero = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(LatestBlogTile, { post: samplePostZeroRatings })
    )
  );

  assert.ok(htmlZero.includes("New"), "LatestBlogTile must fallback to 'New' when unrated");
  assert.ok(htmlZero.includes("0 comments"), "LatestBlogTile must display '0 comments' when zero");
});

test("Slice 8.2: BlogPostPage renders rating summary and clickable comment jump anchor", () => {
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

  // Header metadata row contains ratings and comments
  assert.ok(
    html.includes("href=\"#comments-section\""),
    "BlogPostPage header must render anchor linking to #comments-section"
  );
  assert.ok(
    html.includes("Jump to comments and discussion"),
    "Comment badge anchor must have accessible navigation title"
  );

  // Sidebar metadata box (article.metadata)
  assert.ok(html.includes("article.metadata"), "BlogPostPage sidebar must render article.metadata box");
  assert.ok(html.includes("Average Rating:"), "Sidebar metadata must display 'Average Rating:' row");
  assert.ok(html.includes("Discussions:"), "Sidebar metadata must display 'Discussions:' row");

  // Comments section anchor target
  assert.ok(
    html.includes("id=\"comments-section\""),
    "BlogPostPage must provide an anchor target with id='comments-section'"
  );
});
