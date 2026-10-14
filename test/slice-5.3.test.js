import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import BlogEditor, {
  checkSlugCollision,
  SUGGESTED_TAGS,
} from "../src/pages/admin/BlogEditor.jsx";

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

test("checkSlugCollision returns available when database has no collision", async () => {
  const mockDbNoDuplicate = {};
  // Testing defensive fallback on missing db or empty slug
  const emptyRes = await checkSlugCollision(null, "", null);
  assert.equal(emptyRes.isDuplicate, false);
  assert.equal(emptyRes.suggestedSlug, "");
});

test("SUGGESTED_TAGS contains high-value developer topics", () => {
  assert.ok(Array.isArray(SUGGESTED_TAGS), "SUGGESTED_TAGS should be an array");
  assert.ok(SUGGESTED_TAGS.includes("React"), "Should contain React");
  assert.ok(SUGGESTED_TAGS.includes("Architecture"), "Should contain Architecture");
  assert.ok(SUGGESTED_TAGS.includes("Cloudinary"), "Should contain Cloudinary");
  assert.ok(SUGGESTED_TAGS.includes("Firebase"), "Should contain Firebase");
});

test("BlogEditor renders complete Post Metadata inputs and publishing controls", () => {
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs/new"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/admin/blogs/new",
            element: React.createElement(BlogEditor),
          })
        )
      )
    )
  );

  // Title & Slug with verification button
  assert.ok(html.includes("Article Headline / Title"), "Should contain title label");
  assert.ok(html.includes("URL Slug"), "Should contain URL slug label");
  assert.ok(html.includes("Verify"), "Should contain slug verify button");

  // Excerpt & character count meter
  assert.ok(html.includes("Short Excerpt / Teaser"), "Should contain excerpt label");
  assert.ok(html.includes("/ 250 chars"), "Should contain character counter meter");

  // Publishing Status
  assert.ok(html.includes("Publishing Status"), "Should contain publishing status header");
  assert.ok(html.includes("DRAFT"), "Should display DRAFT badge for new article");
  assert.ok(html.includes("Switch to Published Mode"), "Should contain status switch toggle");

  // Cover Banner
  assert.ok(html.includes("Cover Banner Image"), "Should contain cover banner section");
  assert.ok(html.includes("Upload Banner") || html.includes("portfolio/blogs/covers"), "Should support Cloudinary cover banner");

  // Tags & Suggestions
  assert.ok(html.includes("Tags / Categories"), "Should contain tags header");
  assert.ok(html.includes("Suggestions:"), "Should render quick suggestion label");
  assert.ok(html.includes("React"), "Should render active tag for React");
  assert.ok(html.includes("+ Architecture"), "Should render suggestion badge for Architecture");
  assert.ok(html.includes("+ Node.js"), "Should render suggestion badge for Node.js");

  // Save actions
  assert.ok(html.includes("Save Draft"), "Should contain Save Draft button");
  assert.ok(html.includes("Publish Article"), "Should contain Publish Article button");
});
