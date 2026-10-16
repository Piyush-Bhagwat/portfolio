import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  CodeBlock,
  ReadingProgressBar,
  TableOfContents,
  extractHeadings,
  toHeadingSlug,
  ImageLightboxModal,
} from "../src/components/blog";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";
import { MainContent } from "../src/App.jsx";
import { SAMPLE_INITIAL_POST } from "../src/pages/admin/BlogsCMS.jsx";

const sampleMarkdown = `# Architecture Deep Dive

Understanding modern web rendering pipelines.

## Server-Side Hydration

Hydration is the process of attaching event listeners.

### Edge Performance
Fast response times across distributed CDN nodes.

\`\`\`javascript
function computeLatency(req) {
  return req.endTime - req.startTime;
}
\`\`\`

## Deployment Checklist
- [x] Cloudflare DNS
- [x] Firebase Rules
`;

test("toHeadingSlug normalizes headings into clean URL anchor slugs", () => {
  assert.equal(toHeadingSlug("Architecture Deep Dive"), "architecture-deep-dive");
  assert.equal(toHeadingSlug("Server-Side Hydration!"), "server-side-hydration");
  assert.equal(toHeadingSlug("**Bold** and `Code` Heading"), "bold-and-code-heading");
  assert.equal(toHeadingSlug("Complex & Special # Characters"), "complex-special-characters");
});

test("extractHeadings parses markdown headings and ignores code block fences", () => {
  const headings = extractHeadings(sampleMarkdown);

  assert.equal(headings.length, 4, "Should extract exactly 4 headings");
  assert.deepEqual(headings[0], {
    level: 1,
    title: "Architecture Deep Dive",
    slug: "architecture-deep-dive",
  });
  assert.deepEqual(headings[1], {
    level: 2,
    title: "Server-Side Hydration",
    slug: "server-side-hydration",
  });
  assert.deepEqual(headings[2], {
    level: 3,
    title: "Edge Performance",
    slug: "edge-performance",
  });
  assert.deepEqual(headings[3], {
    level: 2,
    title: "Deployment Checklist",
    slug: "deployment-checklist",
  });

  // Empty markdown check
  assert.deepEqual(extractHeadings(""), []);
  assert.deepEqual(extractHeadings(null), []);
});

test("CodeBlock renders inline and block code with terminal styling", () => {
  // Inline rendering
  const inlineHtml = renderToString(
    React.createElement(CodeBlock, { inline: true }, "const x = 42;")
  );
  assert.ok(inlineHtml.includes("<code"), "Should render <code> tag");
  assert.ok(inlineHtml.includes("const x = 42;"), "Should render inline snippet");

  // Block rendering
  const blockHtml = renderToString(
    React.createElement(
      CodeBlock,
      { className: "language-typescript" },
      "const greet: string = 'Hello';"
    )
  );
  assert.ok(blockHtml.includes("typescript"), "Should display language label");
  assert.ok(blockHtml.includes("Copy"), "Should render Copy button");
  assert.ok(blockHtml.includes("const greet: string = &#x27;Hello&#x27;;") || blockHtml.includes("const greet: string = 'Hello';"), "Should render code text");
});

test("ReadingProgressBar renders progressbar element with accessibility attributes", () => {
  const html = renderToString(
    React.createElement(ReadingProgressBar, { className: "custom-bar" })
  );

  assert.ok(html.includes("role=\"progressbar\""), "Should render progressbar role");
  assert.ok(html.includes("aria-label=\"Reading progress\""), "Should have reading progress aria label");
  assert.ok(html.includes("custom-bar"), "Should include custom className");
  assert.ok(html.includes("bg-terminal-green"), "Should include emerald indicator bar");
});

test("TableOfContents renders heading links with anchor hrefs", () => {
  const html = renderToString(
    React.createElement(TableOfContents, { content: sampleMarkdown })
  );

  assert.ok(html.includes("Table of Contents"), "Should render TOC header");
  assert.ok(html.includes("href=\"#architecture-deep-dive\""), "Should link to h1 slug");
  assert.ok(html.includes("href=\"#server-side-hydration\""), "Should link to h2 slug");
  assert.ok(html.includes("href=\"#edge-performance\""), "Should link to h3 slug");
  assert.ok(html.includes("href=\"#deployment-checklist\""), "Should link to second h2 slug");

  // Null for empty content
  const emptyHtml = renderToString(
    React.createElement(TableOfContents, { content: "No headings here." })
  );
  assert.equal(emptyHtml, "", "Should return null when no headings exist");
});

test("BlogPostPage renders article title, author, metadata, markdown prose and sidebar", () => {
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

  // Header & Author
  assert.ok(html.includes("Building Resilient Web Interfaces with Neo-Brutalism"), "Should render article title");
  assert.ok(html.includes("Piyush Bhagwat"), "Should display author name");
  assert.ok(html.includes("min read"), "Should display read time metadata");
  assert.ok(html.includes("Back to all engineering logs"), "Should include back breadcrumb");

  // Tags
  assert.ok(html.includes("React"), "Should render React tag badge");
  assert.ok(html.includes("UI Engineering"), "Should render UI Engineering tag badge");

  // Share controls
  assert.ok(html.includes("Copy Link"), "Should render Copy Link button");
  assert.ok(html.includes("Share on X"), "Should render X share trigger");
  assert.ok(html.includes("Share on LinkedIn"), "Should render LinkedIn share trigger");

  // Reading ProgressBar & Table of Contents
  assert.ok(html.includes("role=\"progressbar\""), "Should render sticky progress meter");
  assert.ok(html.includes("Table of Contents"), "Should render TOC component");
  assert.ok(html.includes("#architecture-overview"), "Should render slug anchor in TOC");

  // Rendered Markdown Content
  assert.ok(html.includes("id=\"architecture-overview\""), "Rendered h2 should have matching slug id");
  assert.ok(html.includes("id=\"key-tenets\""), "Rendered h3 should have matching slug id");
  assert.ok(html.includes("BrutalButton"), "Should render code block from markdown");

  // Author Bio Box
  assert.ok(html.includes("About the Author"), "Should render About the Author section");
  assert.ok(html.includes("Explore Projects"), "Should render Explore Projects button");
});

test("App routing mounts BlogPostPage at /blogs/:slug", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs/building-resilient-web-interfaces"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(html.includes("Building Resilient Web Interfaces with Neo-Brutalism"), "App should render BlogPostPage at /blogs/:slug");
  assert.ok(html.includes("About the Author"), "Should render author bio inside App layout");
});

test("ImageLightboxModal renders zoom controls, close button, alt caption, and image canvas when open", () => {
  const html = renderToString(
    React.createElement(ImageLightboxModal, {
      isOpen: true,
      image: {
        src: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        alt: "System Architecture Diagram",
        caption: "Figure 1: High level architecture",
      },
      onClose: () => {},
    })
  );

  assert.ok(html.includes("sys.media.fullscreen_viewer"), "Should render terminal title");
  assert.ok(html.includes("Figure 1: High level architecture"), "Should render caption/alt in header and footer");
  assert.ok(html.includes("Zoom in"), "Should render zoom in control");
  assert.ok(html.includes("Zoom out"), "Should render zoom out control");
  assert.ok(html.includes("100%"), "Should display 100% initial zoom level");
  assert.ok(html.includes("Close Lightbox (Esc)"), "Should render close button");
  assert.ok(html.includes("https://res.cloudinary.com/demo/image/upload/sample.jpg"), "Should render target image src");
  assert.ok(html.includes("[Scroll / + -] Zoom"), "Should display keyboard/mouse guide");
});

test("ImageLightboxModal returns null when closed or missing image", () => {
  const closedHtml = renderToString(
    React.createElement(ImageLightboxModal, {
      isOpen: false,
      image: { src: "https://example.com/test.png" },
      onClose: () => {},
    })
  );
  assert.equal(closedHtml, "", "Should render nothing when isOpen is false");

  const noImageHtml = renderToString(
    React.createElement(ImageLightboxModal, {
      isOpen: true,
      image: null,
      onClose: () => {},
    })
  );
  assert.equal(noImageHtml, "", "Should render nothing when image is null");
});

test("BlogPostPage renders thumbnail banner with click-to-fullscreen trigger and zoomable styling", () => {
  const originalCover = SAMPLE_INITIAL_POST.cover_image_url;
  SAMPLE_INITIAL_POST.cover_image_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

  try {
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

    assert.ok(html.includes("cursor-zoom-in"), "Images should have cursor-zoom-in styling for full screen interaction");
    assert.ok(html.includes("Click thumbnail to view in full screen mode"), "Banner should indicate full screen click trigger");
  } finally {
    SAMPLE_INITIAL_POST.cover_image_url = originalCover;
  }
});

