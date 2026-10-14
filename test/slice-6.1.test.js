import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BlogCard, { formatCardDate } from "../src/components/blog/BlogCard.jsx";
import BlogsPage from "../src/pages/public/BlogsPage.jsx";
import { MainContent } from "../src/App.jsx";
import { context } from "../src/context/context.jsx";

const samplePost = {
  id: "building-resilient-web-interfaces",
  title: "Building Resilient Web Interfaces with Neo-Brutalism",
  slug: "building-resilient-web-interfaces",
  excerpt:
    "A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens.",
  content_markdown: "# Hello World",
  cover_image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  tags: ["React", "UI Engineering", "Design Systems"],
  read_time_minutes: 4,
  published: true,
  published_at: new Date("2026-10-14T00:00:00Z"),
};

test("formatCardDate formats timestamps defensively", () => {
  assert.equal(formatCardDate(null), "Recent", "Falsy date should return Recent");
  assert.equal(formatCardDate(undefined), "Recent", "Undefined date should return Recent");

  const formattedDate = formatCardDate(new Date("2026-10-14T00:00:00Z"));
  assert.ok(formattedDate.includes("2026"), "Should include year 2026");

  const mockTimestamp = {
    toDate: () => new Date("2026-08-15T00:00:00Z"),
  };
  assert.ok(formatCardDate(mockTimestamp).includes("Aug"), "Should format Firestore timestamp");
});

test("BlogCard renders title, excerpt, date, read time, and tags", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(BlogCard, { post: samplePost, featured: true })
    )
  );

  // Post details
  assert.ok(html.includes("Building Resilient Web Interfaces with Neo-Brutalism"), "Should render post title");
  assert.ok(html.includes("A deep dive into building tactile"), "Should render excerpt");
  assert.ok(html.includes("4 min read"), "Should display read time metadata");
  assert.ok(html.includes("/blogs/building-resilient-web-interfaces"), "Should link to post route");
  assert.ok(html.includes("Read Article"), "Should render Read Article link");

  // Cover image and featured tag
  assert.ok(html.includes("Featured Article"), "Should display Featured Article badge");
  assert.ok(html.includes("https://res.cloudinary.com"), "Should render Cloudinary cover image URL");

  // Tags
  assert.ok(html.includes("React"), "Should render React tag badge");
  assert.ok(html.includes("UI Engineering"), "Should render UI Engineering tag badge");
});

test("BlogCard renders terminal placeholder when no cover image is provided", () => {
  const noCoverPost = {
    ...samplePost,
    cover_image_url: "",
  };

  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(BlogCard, { post: noCoverPost })
    )
  );

  assert.ok(html.includes("technical_publication.md"), "Should render monospace placeholder");
  assert.ok(html.includes("sys.pub.v2"), "Should render sys.pub watermark");
});

test("BlogsPage renders hero header, search input, and Bento article list", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs"] },
      React.createElement(BlogsPage)
    )
  );

  // Hero section
  assert.ok(html.includes("Engineering Logs &amp; Publications") || html.includes("Engineering Logs & Publications"), "Should render header title");
  assert.ok(html.includes("sys.publication.engineering_logs"), "Should render terminal breadcrumb");

  // Search input
  assert.ok(html.includes("Search articles by title, keyword, or concept..."), "Should render search input");

  // Topics / Filter badges
  assert.ok(html.includes("All Topics"), "Should render All Topics filter tab");

  // Initial article card
  assert.ok(html.includes("Building Resilient Web Interfaces with Neo-Brutalism"), "Should display article card");
});

test("App public navigation includes Articles link and routes to BlogsPage", () => {
  const html = renderToString(
    React.createElement(
      context.Provider,
      { value: { projects: [] } },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/blogs"] },
        React.createElement(MainContent)
      )
    )
  );

  assert.ok(html.includes('href="/blogs"'), "Navigation should link to /blogs");
  assert.ok(html.includes("Articles"), "Navigation should display Articles link");
  assert.ok(html.includes("Engineering Logs &amp; Publications") || html.includes("Engineering Logs & Publications"), "Route /blogs should render BlogsPage");
});
