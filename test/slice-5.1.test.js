import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import MarkdownEditorToolbar from "../src/components/blog/MarkdownEditorToolbar.jsx";
import MarkdownPreview from "../src/components/blog/MarkdownPreview.jsx";
import BlogEditor, {
  calculateReadTime,
  slugifyTitle,
  getTopSuggestedTags,
  SUGGESTED_TAGS,
} from "../src/pages/admin/BlogEditor.jsx";
import { MainContent } from "../src/App.jsx";
import { context } from "../src/context/context.jsx";

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

test("Markdown utilities calculateReadTime and slugifyTitle", () => {
  assert.equal(calculateReadTime(""), 1, "Empty string should have 1 min read default");
  assert.equal(
    calculateReadTime(Array(450).fill("word").join(" ")),
    3,
    "450 words should calculate to 3 mins"
  );

  assert.equal(
    slugifyTitle("Building Resilient Web Interfaces with Neo-Brutalism!"),
    "building-resilient-web-interfaces-with-neo-brutalism"
  );
});

test("MarkdownEditorToolbar renders formatting controls and view modes", () => {
  const html = renderToString(
    React.createElement(MarkdownEditorToolbar, {
      onInsert: () => {},
      viewMode: "split",
      onViewModeChange: () => {},
      syncScroll: true,
      onToggleSyncScroll: () => {},
    })
  );

  // Formatting actions
  assert.ok(html.includes("Heading 1"), "Should have Heading 1 button");
  assert.ok(html.includes("Heading 2"), "Should have Heading 2 button");
  assert.ok(html.includes("Bold"), "Should have Bold button");
  assert.ok(html.includes("Italic"), "Should have Italic button");
  assert.ok(html.includes("Inline Code"), "Should have Code button");
  assert.ok(html.includes("Insert Link"), "Should have Link button");
  assert.ok(html.includes("Insert Image"), "Should have Image button");
  assert.ok(html.includes("Insert Table"), "Should have Table button");

  // Controls
  assert.ok(html.includes("Sync Scroll"), "Should have Sync Scroll toggle");
  assert.ok(html.includes("Split Screen View"), "Should have split view control");
});

test("MarkdownPreview renders empty and formatted Markdown content", () => {
  // Empty content
  const emptyHtml = renderToString(
    React.createElement(MarkdownPreview, { content: "" })
  );
  assert.ok(
    emptyHtml.includes("Real-time preview will render here"),
    "Should render empty placeholder"
  );

  // Formatted content
  const markdown = `
# Main Header
## Sub Header
A paragraph with **bold** text and [external link](https://example.com).

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

> A noteworthy quote.

| Col 1 | Col 2 |
| :--- | :--- |
| Val 1 | Val 2 |
`;

  const formattedHtml = renderToString(
    React.createElement(MarkdownPreview, { content: markdown })
  );

  assert.ok(formattedHtml.includes("Main Header"), "Should render H1 heading");
  assert.ok(formattedHtml.includes("Sub Header"), "Should render H2 heading");
  assert.ok(formattedHtml.includes("<strong>bold</strong>"), "Should render bold tag");
  assert.ok(formattedHtml.includes("https://example.com"), "Should render link href");
  assert.ok(formattedHtml.includes("Hello World"), "Should render code text");
  assert.ok(formattedHtml.includes("A noteworthy quote"), "Should render blockquote");
  assert.ok(formattedHtml.includes("<table"), "Should render table element");
  assert.ok(formattedHtml.includes("Val 1"), "Should render table cell");
});

test("BlogEditor renders split-screen workspace, metadata metrics, and actions", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/blogs/new"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
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

  assert.ok(
    html.includes("Markdown Authoring Studio"),
    "Should render editor header title"
  );
  assert.ok(html.includes("Article Headline / Title"), "Should contain title label");
  assert.ok(html.includes("URL Slug"), "Should contain URL slug label");
  assert.ok(html.includes("Save Draft"), "Should contain Save Draft button");
  assert.ok(html.includes("Publish Article"), "Should contain Publish Article button");
  assert.ok(html.includes("min read"), "Should display estimated read time metadata");
  assert.ok(html.includes("words"), "Should display word count metadata");
  assert.ok(html.includes("EDITOR (MARKDOWN SOURCE)"), "Should render editor pane header");
  assert.ok(html.includes("LIVE PREVIEW (GFM RENDERED)"), "Should render preview pane header");
});

test("Public Home Page has clean layout without temporary refactoring banner", () => {
  const html = renderToString(
    React.createElement(
      context.Provider,
      { value: { projects: [] } },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/"] },
        React.createElement(MainContent)
      )
    )
  );

  assert.ok(
    !html.includes("Website refactoring under process"),
    "Temporary refactoring banner should be cleanly removed for production"
  );
});

test("getTopSuggestedTags prioritizes used tags by frequency, preserves base tags, deduplicates, and caps to top 15", () => {
  const mockUsedSources = [
    { tags: ["Docker", "Kubernetes", "Docker", "Architecture"] },
    { tags: ["Kubernetes", "DevOps", "Docker"] },
    "Architecture",
    "Microservices",
  ];

  const activeTags = ["Architecture"]; // Should be excluded

  const suggestions = getTopSuggestedTags(
    mockUsedSources,
    activeTags,
    SUGGESTED_TAGS,
    15
  );

  // 1. Used tags should be at the front, sorted by frequency
  // Docker: 3 times
  // Kubernetes: 2 times
  // Architecture: 2 times (excluded by activeTags)
  // DevOps: 1 time
  // Microservices: 1 time
  assert.equal(suggestions[0], "Docker", "Top used tag should be first");
  assert.equal(suggestions[1], "Kubernetes", "Second most frequent tag should be second");
  assert.ok(!suggestions.includes("Architecture"), "Active tag must be excluded from suggestions");
  assert.ok(suggestions.includes("DevOps"), "DevOps should be included in used tags");
  assert.ok(suggestions.includes("Microservices"), "Microservices should be included in used tags");

  // 2. Base suggestions should follow
  assert.ok(
    suggestions.includes("React") || suggestions.includes("CSS / Tailwind"),
    "Base suggestions should fill remaining slots"
  );

  // 3. Length should not exceed maxCount (15)
  assert.ok(suggestions.length <= 15, `Expected <= 15 suggestions, got ${suggestions.length}`);

  // 4. All suggestions should be unique (case-insensitive)
  const lowerSet = new Set(suggestions.map((s) => s.toLowerCase()));
  assert.equal(lowerSet.size, suggestions.length, "All suggestions must be unique");
});

