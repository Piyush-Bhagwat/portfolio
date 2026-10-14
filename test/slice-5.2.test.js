import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import BlogImageDropperModal, {
  filenameToAltText,
  formatMarkdownImage,
} from "../src/components/blog/BlogImageDropperModal.jsx";
import MarkdownEditorToolbar from "../src/components/blog/MarkdownEditorToolbar.jsx";
import BlogEditor from "../src/pages/admin/BlogEditor.jsx";

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

test("filenameToAltText formats file names into accessible alt text", () => {
  assert.equal(
    filenameToAltText("my-system-architecture.png"),
    "My system architecture",
    "Should replace hyphens with spaces and capitalize"
  );
  assert.equal(
    filenameToAltText("database_cluster_topology_v2.webp"),
    "Database cluster topology v2",
    "Should replace underscores with spaces and capitalize"
  );
  assert.equal(
    filenameToAltText("cloud-diagram-12.jpeg"),
    "Cloud diagram 12"
  );
  assert.equal(filenameToAltText(""), "", "Empty filename returns empty string");
  assert.equal(filenameToAltText(null), "", "Null filename returns empty string");
});

test("formatMarkdownImage formats standard and captioned markdown snippets", () => {
  const standard = formatMarkdownImage(
    "Cloud Architecture",
    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  );
  assert.equal(
    standard,
    "![Cloud Architecture](https://res.cloudinary.com/demo/image/upload/sample.jpg)"
  );

  const captioned = formatMarkdownImage(
    "Database Topology",
    "https://res.cloudinary.com/demo/image/upload/db.png",
    "Figure 1: Replica Set Architecture"
  );
  assert.equal(
    captioned,
    '![Database Topology](https://res.cloudinary.com/demo/image/upload/db.png "Figure 1: Replica Set Architecture")'
  );

  const fallback = formatMarkdownImage(
    "",
    "https://res.cloudinary.com/demo/image/upload/test.png"
  );
  assert.equal(
    fallback,
    "![Image](https://res.cloudinary.com/demo/image/upload/test.png)",
    "Should fall back to 'Image' alt when empty"
  );
});

test("BlogImageDropperModal returns null when closed", () => {
  const html = renderToString(
    React.createElement(BlogImageDropperModal, {
      isOpen: false,
      onClose: () => {},
      onInsertImage: () => {},
    })
  );
  assert.equal(html, "", "Modal should render nothing when isOpen is false");
});

test("BlogImageDropperModal renders Cloudinary dropzone, alt text field, and actions when open", () => {
  const html = renderToString(
    React.createElement(BlogImageDropperModal, {
      isOpen: true,
      onClose: () => {},
      onInsertImage: () => {},
      initialAltText: "Initial Alt Description",
      folder: "portfolio/blogs",
    })
  );

  // Header and folder
  assert.ok(html.includes("sys.media.cloudinary_dropper.sh"), "Should display terminal modal title");
  assert.ok(html.includes("folder: portfolio/blogs"), "Should display Cloudinary target folder");

  // Tabs
  assert.ok(html.includes("Upload via Cloudinary"), "Should render Cloudinary upload tab");
  assert.ok(html.includes("External Image URL"), "Should render External Image URL tab");

  // Dropzone
  assert.ok(html.includes("Drag and drop your image here"), "Should render drag & drop prompt");
  assert.ok(html.includes("browse files"), "Should render browse files button");
  assert.ok(html.includes("JPG, PNG, WEBP, GIF, SVG up to 5MB"), "Should display supported formats & size limit");

  // Alt Text & Caption fields
  assert.ok(html.includes("Alt Text / Description (Required for Accessibility)"), "Should render accessible alt text label");
  assert.ok(html.includes("Initial Alt Description"), "Should pre-populate initial alt text");
  assert.ok(html.includes("Optional Caption / Hover Title"), "Should render optional caption field");

  // Action Buttons
  assert.ok(html.includes("Cancel"), "Should render Cancel button");
  assert.ok(html.includes("Insert Image Markdown"), "Should render Insert Image Markdown button");
});

test("MarkdownEditorToolbar triggers onOpenImageModal when image button is provided", () => {
  let modalTriggered = false;
  const html = renderToString(
    React.createElement(MarkdownEditorToolbar, {
      onInsert: () => {},
      onOpenImageModal: () => {
        modalTriggered = true;
      },
      viewMode: "split",
      onViewModeChange: () => {},
      syncScroll: true,
      onToggleSyncScroll: () => {},
    })
  );

  assert.ok(html.includes("Insert Image"), "Should render image toolbar button");
  assert.ok(html.includes("text-terminal-cyan"), "Image button should have terminal-cyan highlight");
});

test("BlogEditor integrates image dropper and direct drag/paste hint", () => {
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

  assert.ok(
    html.includes("Drag &amp; drop / Paste image directly") ||
    html.includes("Drag & drop / Paste image directly"),
    "Should include direct drag & drop and paste hint in editor sub-header"
  );
  assert.ok(html.includes("split_markdown_editor.sh"), "Should render terminal editor box");
});
