import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TableOfContents from "../src/components/blog/TableOfContents.jsx";
import ArticleActionsBar from "../src/components/blog/ArticleActionsBar.jsx";
import CommentItem from "../src/components/blog/CommentItem.jsx";
import CommentBox, { formatCommentDate } from "../src/components/blog/CommentBox.jsx";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";

const sampleMarkdown = `
# Title
## Architecture Overview
Content for architecture.
### Key Tenets
Tenets here.
## Implementation Strategy
Strategy content.
`;

const sampleComments = [
  {
    id: "c-1",
    author_name: "Alex Dev",
    rating: 5,
    content: "Brilliant breakdown of Neo-Brutalist design tokens!",
    created_at: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    admin_reply: {
      author: "Piyush Bhagwat",
      content: "Thank you Alex! Glad the architectural breakdown resonated.",
      replied_at: new Date(Date.now() - 1000 * 60 * 5),
    },
  },
  {
    id: "c-2",
    author_name: "Sarah K",
    rating: 4,
    content: "Great performance optimization tips for Firestore.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    admin_reply: null,
  },
  {
    id: "c-3",
    author_name: "Rohan M",
    rating: 5,
    content: "The dual-theme organic celadon palette is stunning.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    admin_reply: null,
  },
  {
    id: "c-4",
    author_name: "Elena V",
    rating: 5,
    content: "Super clean layout and sticky sidebar.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    admin_reply: null,
  },
];

test("Slice 8.3: TableOfContents constrains list scroll to max-h-[30vh]", () => {
  const html = renderToString(
    React.createElement(TableOfContents, { content: sampleMarkdown })
  );

  assert.ok(html.includes("Table of Contents"), "TOC must render header");
  assert.ok(html.includes("max-h-[30vh]"), "TOC must enforce max-h-[30vh] for constrained Tier 1 scroll");
  assert.ok(html.includes("#architecture-overview"), "TOC must generate valid heading anchors");
  assert.ok(html.includes("#implementation-strategy"), "TOC must generate valid heading anchors");
});

test("Slice 8.3: ArticleActionsBar renders Tier 2 Reading Progress & Action Controls", () => {
  const html = renderToString(
    React.createElement(ArticleActionsBar, {
      readTime: 4,
      formattedDate: "Feb 15, 2026",
      ratingAverage: 4.8,
      ratingCount: 15,
      commentCount: 9,
      copiedLink: false,
      onCopyLink: () => {},
      onShareTwitter: () => {},
      onShareLinkedIn: () => {},
    })
  );

  // Reading Progress gauge
  assert.ok(html.includes("Reading Progress:"), "Must render reading progress label");
  assert.ok(html.includes("Reading Depth:"), "Must render estimated reading depth");
  assert.ok(html.includes("4 min"), "Must display reading time");

  // Metadata rows
  assert.ok(html.includes("Average Rating:"), "Must render Average Rating row");
  assert.ok(html.includes("4.8 (15)"), "Must render formatted rating average and count");
  assert.ok(html.includes("Discussions:"), "Must render Discussions row");
  assert.ok(html.includes("9 comments"), "Must render formatted comment count");
  assert.ok(html.includes("Feb 15, 2026"), "Must render publication date");

  // Action buttons
  assert.ok(html.includes("Share on X"), "Must render Share on X button");
  assert.ok(html.includes("Share on LinkedIn"), "Must render Share on LinkedIn button");
  assert.ok(html.includes("Copy Link"), "Must render Copy Link button");
});

test("Slice 8.3: ArticleActionsBar renders 'Link Copied!' feedback state", () => {
  const html = renderToString(
    React.createElement(ArticleActionsBar, {
      copiedLink: true,
      onCopyLink: () => {},
      onShareTwitter: () => {},
      onShareLinkedIn: () => {},
    })
  );

  assert.ok(html.includes("Link Copied!"), "Must display feedback text when link is copied");
});

test("Slice 8.3: CommentItem renders reader review and Verified Author response", () => {
  const html = renderToString(
    React.createElement(CommentItem, { comment: sampleComments[0] })
  );

  assert.ok(html.includes("lucide-star") || html.includes("fill-amber-500"), "Must render star rating badge");
  assert.ok(html.includes(">5<"), "Must render rating score");
  assert.ok(html.includes("Brilliant breakdown"), "Must render comment content");

  // Verified Author Reply
  assert.ok(html.includes("Verified Author"), "Must render Verified Author badge");
  assert.ok(html.includes("Glad the architectural breakdown resonated"), "Must render author reply content");
});

test("Slice 8.3: CommentBox renders empty state when no discussions exist", () => {
  const html = renderToString(
    React.createElement(CommentBox, {
      ratingAverage: 0,
      ratingCount: 0,
      commentCount: 0,
      comments: [],
    })
  );

  assert.ok(html.includes("id=\"comments-section\""), "Must provide id='comments-section' anchor target");
  assert.ok(html.includes("community.discussion"), "Must render terminal title");
  assert.ok(html.includes("0 comments"), "Must display 0 comments");
  assert.ok(html.includes("No discussions yet"), "Must render empty state message");
  assert.ok(html.includes("Leave a Review / Comment"), "Must render CTA to submit review");
});

test("Slice 8.3: CommentBox displays initial 3 comments preview and 'Expand / View All' button", () => {
  const html = renderToString(
    React.createElement(CommentBox, {
      ratingAverage: 4.9,
      ratingCount: 18,
      commentCount: 12,
      comments: sampleComments, // 4 items provided
    })
  );

  // Review Summary
  assert.ok(html.includes("4.9 (18)"), "Must render rating score and count");
  assert.ok(html.includes("12 comments"), "Must render total comment count badge");

  // Initial preview: only top 3 rendered by default
  assert.ok(html.includes("Alex Dev"), "First comment must be visible");
  assert.ok(html.includes("Sarah K"), "Second comment must be visible");
  assert.ok(html.includes("Rohan M"), "Third comment must be visible");
  assert.ok(!html.includes("Elena V"), "Fourth comment must NOT be rendered in collapsed 3-comment preview");

  // Expand button
  assert.ok(html.includes("Expand / View All (12)"), "Must display Expand toggle button with total count");
});

test("Slice 8.3: formatCommentDate formats relative and calendar timestamps defensively", () => {
  assert.strictEqual(formatCommentDate(null), "Just now");
  assert.strictEqual(formatCommentDate(new Date(Date.now() - 1000 * 30)), "Just now");
  assert.strictEqual(formatCommentDate(new Date(Date.now() - 1000 * 60 * 10)), "10m ago");
  assert.strictEqual(formatCommentDate(new Date(Date.now() - 1000 * 60 * 60 * 5)), "5h ago");
  assert.strictEqual(formatCommentDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)), "3d ago");
  assert.strictEqual(formatCommentDate(new Date("2025-01-01T00:00:00Z")), "Jan 1, 2025");
});

test("Slice 8.3: BlogPostPage renders full Three-Tier right sidebar layout", () => {
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

  // Tier 1: Table of Contents
  assert.ok(html.includes("Table of Contents"), "Must include Tier 1 Table of Contents");

  // Tier 2: Reading Progress & Metadata Actions
  assert.ok(html.includes("Reading Progress:"), "Must include Tier 2 Reading Progress");
  assert.ok(html.includes("article.metadata"), "Must include Tier 2 Metadata container");

  // Tier 3: Comment Box & Anchor
  assert.ok(html.includes("community.discussion"), "Must include Tier 3 Community Discussion Box");
  assert.ok(html.includes("id=\"comments-section\""), "Must include Tier 3 anchor target");

  // Header jump link
  assert.ok(html.includes("href=\"#comments-section\""), "Header comment badge must jump to #comments-section");

  // Responsive sidebar grid
  assert.ok(html.includes("lg:col-span-4"), "Sidebar must be styled for desktop 4-column span");
  assert.ok(html.includes("sticky top-20"), "Sidebar must feature sticky top-20 positioning");
});
