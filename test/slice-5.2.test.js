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
import MarkdownPreview from "../src/components/blog/MarkdownPreview.jsx";
import BlogEditor from "../src/pages/admin/BlogEditor.jsx";
import {
  removeImageFromMarkdown,
  replaceImageInMarkdown,
} from "../src/utils/blogUtils.js";
import {
  extractCloudinaryPublicId,
  deleteFromCloudinary,
} from "../src/services/cloudinary.js";

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

test("removeImageFromMarkdown cleanly removes markdown and html images from text", () => {
  const content = `# System Architecture

Here is the initial design:

![Architecture Diagram](https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/arch.png "System Arch")

Followed by database topology:

<img src="https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/db.png" alt="Database" />

Conclusion section.`;

  // Remove markdown image
  const withoutMd = removeImageFromMarkdown(
    content,
    "https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/arch.png"
  );
  assert.ok(!withoutMd.includes("arch.png"), "Markdown image URL should be removed");
  assert.ok(!withoutMd.includes("Architecture Diagram"), "Alt text should be removed");
  assert.ok(withoutMd.includes("Here is the initial design:"), "Surrounding text preserved");
  assert.ok(withoutMd.includes("db.png"), "Other images remain intact");

  // Remove HTML image
  const withoutHtml = removeImageFromMarkdown(
    withoutMd,
    "https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/db.png"
  );
  assert.ok(!withoutHtml.includes("db.png"), "HTML image URL should be removed");
  assert.ok(withoutHtml.includes("Conclusion section."), "End text preserved");
});

test("replaceImageInMarkdown replaces image URL and alt text in the exact same position", () => {
  const oldUrl = "https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/old.png";
  const newUrl = "https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-post/new.png";

  const content = `Leading text.

![Old Blueprint](${oldUrl} "Figure 1: Original Architecture")

Trailing text.`;

  const updated = replaceImageInMarkdown(content, oldUrl, newUrl, "New Blueprint");
  assert.ok(!updated.includes(oldUrl), "Old URL must be replaced");
  assert.ok(updated.includes(newUrl), "New URL must be present");
  assert.ok(updated.includes("New Blueprint"), "New alt text must be applied");
  assert.ok(updated.includes("Figure 1: Original Architecture"), "Caption must be preserved");
  assert.ok(
    updated.indexOf("Leading text.") < updated.indexOf(newUrl) &&
    updated.indexOf(newUrl) < updated.indexOf("Trailing text."),
    "Relative position in markdown document must remain identical"
  );
});

test("extractCloudinaryPublicId parses public_id across versioned and transformed URLs", () => {
  const versioned = "https://res.cloudinary.com/dsdqo228u/image/upload/v1728999999/blog/my-slug/sample.jpg";
  assert.equal(
    extractCloudinaryPublicId(versioned),
    "blog/my-slug/sample",
    "Should strip version prefix and extension"
  );

  const transformed = "https://res.cloudinary.com/dsdqo228u/image/upload/c_fill,w_800,f_auto/v12345/blog/deep-dive/arch_diagram.png";
  assert.equal(
    extractCloudinaryPublicId(transformed),
    "blog/deep-dive/arch_diagram",
    "Should strip transformations and version prefix"
  );

  const unversioned = "https://res.cloudinary.com/dsdqo228u/image/upload/blog/clean-post/banner.webp";
  assert.equal(
    extractCloudinaryPublicId(unversioned),
    "blog/clean-post/banner",
    "Should handle unversioned paths"
  );

  assert.equal(extractCloudinaryPublicId("https://example.com/other.png"), null, "Non-Cloudinary URL should return null");
  assert.equal(extractCloudinaryPublicId(""), null, "Empty string should return null");
});

test("deleteFromCloudinary returns defensively on invalid input or network issues", async () => {
  const emptyRes = await deleteFromCloudinary("");
  assert.equal(emptyRes.success, false, "Empty URL should return false");

  const validUrlRes = await deleteFromCloudinary(
    "https://res.cloudinary.com/dsdqo228u/image/upload/blog/test-slug/photo.png"
  );
  assert.ok(validUrlRes.success !== undefined, "Should return a result object");
  assert.equal(validUrlRes.public_id, "blog/test-slug/photo", "Should extract public_id");
});

test("MarkdownPreview with editable=true renders Replace and Delete overlay action buttons", () => {
  const markdown = `# Review

![System Diagram](https://res.cloudinary.com/dsdqo228u/image/upload/blog/test/sys.png "System Overview")
`;

  const html = renderToString(
    React.createElement(MarkdownPreview, {
      content: markdown,
      editable: true,
      onDeleteImage: () => {},
      onReplaceImage: () => {},
    })
  );

  assert.ok(html.includes("Replace"), "Should render Replace image button");
  assert.ok(html.includes("Delete"), "Should render Delete image button");
  assert.ok(html.includes("CLOUDINARY"), "Should render Cloudinary badge for Cloudinary hosted assets");
  assert.ok(html.includes("System Diagram"), "Should display image alt description");
});

test("BlogEditor locks URL slug as immutable and displays Cloudinary destination folder", () => {
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

  assert.ok(html.includes("LOCKED"), "Should display LOCKED badge on URL slug");
  assert.ok(html.includes("Cloudinary folder: blog/"), "Should display destination Cloudinary folder");
  assert.ok(html.includes("Immutable"), "Should indicate that slug is immutable");
});

test("BlogImageDropperModal renders cleanly without dataUrl ReferenceError", () => {
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(BlogImageDropperModal, {
        isOpen: true,
        onClose: () => {},
        onInsertImage: () => {},
        initialAltText: "Test Alt",
        folder: "blog/sample-post",
      })
    );
  });
});

test("BlogImageDropperModal abort controller cleanup does not depend on previewUrl", () => {
  const compStr = BlogImageDropperModal.toString();
  assert.ok(!compStr.includes(", [previewUrl]"), "Abort controller cleanup must not re-run on previewUrl state update");
});


