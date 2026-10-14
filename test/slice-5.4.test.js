import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import ConfirmModal from "../src/components/common/ConfirmModal.jsx";
import BlogsCMS, {
  SAMPLE_INITIAL_POST,
  formatBlogDate,
} from "../src/pages/admin/BlogsCMS.jsx";
import { MainContent } from "../src/App.jsx";

const mockAuthAdmin = {
  user: { email: "piyushbhagwat5@gmail.com" },
  isAdmin: true,
  loading: false,
  error: null,
  adminEmail: "piyushbhagwat5@gmail.com",
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
  clearError: () => {},
};

test("ConfirmModal renders correctly based on isOpen prop", () => {
  // Closed modal
  const closedHtml = renderToString(
    React.createElement(ConfirmModal, {
      isOpen: false,
      onClose: () => {},
      onConfirm: () => {},
    })
  );
  assert.equal(closedHtml, "", "Closed ConfirmModal should render nothing");

  // Open modal
  const openHtml = renderToString(
    React.createElement(ConfirmModal, {
      isOpen: true,
      onClose: () => {},
      onConfirm: () => {},
      title: "sys.blog.delete.sh",
      message: "Are you sure you want to delete this test post?",
      confirmText: "Delete Article",
      cancelText: "Keep Draft",
      variant: "danger",
    })
  );

  assert.ok(openHtml.includes("sys.blog.delete.sh"), "Should display dialog title");
  assert.ok(openHtml.includes("Are you sure you want to delete this test post?"), "Should display prompt message");
  assert.ok(openHtml.includes("Delete Article"), "Should render confirm button label");
  assert.ok(openHtml.includes("Keep Draft"), "Should render cancel button label");
});

test("formatBlogDate formats Firestore timestamps and dates defensively", () => {
  assert.equal(formatBlogDate(null), "Draft", "Falsy date returns Draft");
  assert.equal(formatBlogDate(undefined), "Draft", "Undefined date returns Draft");

  const testDate = new Date("2026-10-14T00:00:00Z");
  const formatted = formatBlogDate(testDate);
  assert.ok(formatted.includes("2026"), "Should contain year 2026");

  // Mock Firestore Timestamp with toDate method
  const mockTimestamp = {
    toDate: () => new Date("2026-05-20T00:00:00Z"),
  };
  const tsFormatted = formatBlogDate(mockTimestamp);
  assert.ok(tsFormatted.includes("2026") && tsFormatted.includes("May"), "Should format Firestore Timestamp");
});

test("SAMPLE_INITIAL_POST adheres to technical blog schema", () => {
  assert.ok(SAMPLE_INITIAL_POST.id, "Should have id");
  assert.ok(SAMPLE_INITIAL_POST.title, "Should have title");
  assert.ok(SAMPLE_INITIAL_POST.slug, "Should have slug");
  assert.ok(SAMPLE_INITIAL_POST.excerpt, "Should have excerpt");
  assert.ok(SAMPLE_INITIAL_POST.content_markdown, "Should have markdown content");
  assert.ok(Array.isArray(SAMPLE_INITIAL_POST.tags), "Tags should be an array");
  assert.equal(typeof SAMPLE_INITIAL_POST.published, "boolean", "Published should be boolean");
});

test("BlogsCMS renders header, search, filter tabs, and action controls", () => {
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

  // Header & breadcrumbs
  assert.ok(html.includes("sys.cms.blogs"), "Should contain sys.cms.blogs breadcrumb");
  assert.ok(html.includes("Technical Articles CMS"), "Should render main page title");

  // Metadata metrics
  assert.ok(html.includes("Total:"), "Should display total count metadata");
  assert.ok(html.includes("published"), "Should display published count metadata");
  assert.ok(html.includes("drafts"), "Should display drafts count metadata");

  // Action controls
  assert.ok(html.includes("Sync"), "Should render Sync button");
  assert.ok(html.includes("New Article"), "Should render New Article button");

  // Filter tabs
  assert.ok(html.includes("All ("), "Should render All filter tab");
  assert.ok(html.includes("Published ("), "Should render Published filter tab");
  assert.ok(html.includes("Drafts ("), "Should render Drafts filter tab");

  // Search
  assert.ok(html.includes("Search by title, slug, tag..."), "Should render search input with placeholder");

  // Terminal table container
  assert.ok(html.includes("articles_manifest.tbl"), "Should render terminal table container");
});

test("App routes /admin/blogs to BlogsCMS in protected layout", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs"] },
        React.createElement(MainContent)
      )
    )
  );

  assert.ok(html.includes("Technical Articles CMS"), "Should render BlogsCMS when navigating to /admin/blogs");
});
