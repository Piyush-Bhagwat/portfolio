import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import AdminLayout from "../src/layouts/AdminLayout.jsx";
import BlogsCMS from "../src/pages/admin/BlogsCMS.jsx";
import BlogInteractCMS, { formatCommentDate } from "../src/pages/admin/BlogInteractCMS.jsx";
import AdminReplyModal from "../src/components/admin/AdminReplyModal.jsx";

const mockAuthAdmin = {
  user: { email: "piyushbhagwat5@gmail.com", displayName: "Piyush Bhagwat" },
  isAdmin: true,
  loading: false,
  error: null,
  adminEmail: "piyushbhagwat5@gmail.com",
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
  clearError: () => {},
};

test("Slice 8.6: AdminLayout renders Technical Blogs and Blog Interact navigation links", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs/interact"] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(AdminLayout) },
            React.createElement(Route, {
              path: "/admin/blogs/interact",
              element: React.createElement("div", null, "Interact Child"),
            })
          )
        )
      )
    )
  );

  assert.ok(html.includes("Technical Blogs"), "AdminLayout must include Technical Blogs link");
  assert.ok(html.includes("Blog Interact"), "AdminLayout must include Blog Interact link");
  assert.ok(html.includes("Interact Child"), "AdminLayout must render nested child content");
});

test("Slice 8.6: BlogsCMS renders the Interact sub-navigation tab", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/admin/blogs",
            element: React.createElement(BlogsCMS),
          })
        )
      )
    )
  );

  assert.ok(html.includes("Articles CMS"), "Must render BlogsCMS header");
  assert.ok(html.includes("/admin/blogs/interact"), "Must link to /admin/blogs/interact");
  assert.ok(html.includes("Interact"), "Must render Interact tab button");
});

test("Slice 8.6: BlogInteractCMS renders header and sub-navigation tabs", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs/interact"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/admin/blogs/interact",
            element: React.createElement(BlogInteractCMS),
          })
        )
      )
    )
  );

  // Breadcrumbs & Header
  assert.ok(html.includes("sys.cms.blogs"), "Must render breadcrumb namespace");
  assert.ok(html.includes("interact"), "Must render interact breadcrumb section");
  assert.ok(
    html.includes("Blog Community &amp; Interactions") ||
      html.includes("Blog Community & Interactions"),
    "Must render page title"
  );

  // Sub-Navigation tabs
  assert.ok(html.includes("/admin/blogs"), "Must link back to Articles view");
  assert.ok(html.includes("Articles"), "Must render Articles tab");
  assert.ok(html.includes("Interact"), "Must render Interact tab");
});

test("Slice 8.6: BlogInteractCMS renders summary metrics bar and multi-filter toolbar", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs/interact"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/admin/blogs/interact",
            element: React.createElement(BlogInteractCMS),
          })
        )
      )
    )
  );

  // Metrics Bar
  assert.ok(html.includes("Total Reviews"), "Must display Total Reviews metric");
  assert.ok(html.includes("Visible (Live)"), "Must display Visible Live metric");
  assert.ok(html.includes("Hidden (Soft)"), "Must display Hidden Soft metric");
  assert.ok(html.includes("Avg Rating"), "Must display Avg Rating metric");
  assert.ok(html.includes("Author Replies"), "Must display Author Replies metric");

  // Multi-Filter Controls
  assert.ok(html.includes("All Blog Articles"), "Must render Blog Articles dropdown default");
  assert.ok(html.includes("Visible ("), "Must render Visible filter button");
  assert.ok(html.includes("Hidden ("), "Must render Hidden filter button");
  assert.ok(html.includes("All Stars"), "Must render Rating filter dropdown default");
  assert.ok(html.includes("5 Stars Only"), "Must render 5 Stars rating option");
  assert.ok(html.includes("Search author, keyword, post..."), "Must render search input placeholder");

  // Terminal box container
  assert.ok(html.includes("comments_inbox.tbl"), "Must render terminal comments inbox table container");
});

test("Slice 8.6: AdminReplyModal renders author response composer with comment context", () => {
  const mockComment = {
    id: "test-comment-1",
    author_name: "Alex Rivera",
    post_title: "Building Resilient Web Interfaces",
    post_id: "building-resilient-web-interfaces",
    rating: 5,
    content: "Fantastic architectural breakdown of CSS isolation and zero-runtime tokens!",
    admin_reply: null,
  };

  const html = renderToString(
    React.createElement(AdminReplyModal, {
      isOpen: true,
      comment: mockComment,
      onClose: () => {},
      onSaveReply: async () => {},
      adminName: "Piyush Bhagwat",
    })
  );

  // Modal Header & Context
  assert.ok(html.includes("sys.author_reply_composer.sh"), "Must render modal terminal header");
  assert.ok(
    html.includes("@Alex Rivera") || html.includes("@<!-- -->Alex Rivera"),
    "Must display target comment author handle"
  );
  assert.ok(html.includes("Building Resilient Web Interfaces"), "Must display target post title");
  assert.ok(
    html.includes("Fantastic architectural breakdown of CSS isolation"),
    "Must display target comment excerpt"
  );

  // Input & Textarea
  assert.ok(html.includes("id=\"reply-author-name\""), "Must render author name input");
  assert.ok(html.includes("id=\"reply-content\""), "Must render reply content textarea");
  assert.ok(html.includes("0/1000") || html.includes("0<!-- -->/1000"), "Must render character counter");
  assert.ok(html.includes("Publish Official Reply"), "Must render submit button");
  assert.ok(html.includes("Cancel"), "Must render cancel button");
});

test("Slice 8.6: formatCommentDate handles timestamps, dates, and fallbacks", () => {
  const fixedDate = new Date("2026-10-15T14:30:00Z");
  const formattedDate = formatCommentDate(fixedDate);
  assert.ok(typeof formattedDate === "string", "Formatted date should be a string");
  assert.ok(formattedDate.length > 0, "Formatted date should not be empty");

  // Firestore timestamp mock with toDate()
  const mockTimestamp = {
    toDate: () => fixedDate,
  };
  assert.equal(formatCommentDate(mockTimestamp), formattedDate);

  // Fallback for null / undefined
  assert.equal(formatCommentDate(null), "Recent");
  assert.equal(formatCommentDate(undefined), "Recent");
});
