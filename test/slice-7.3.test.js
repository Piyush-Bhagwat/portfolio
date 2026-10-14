import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { getOptimizedImageUrl } from "../src/services/cloudinary.js";
import BlogPostPage from "../src/pages/public/BlogPostPage.jsx";
import { ProjectCard } from "../src/components/project";
import { HeroTile } from "../src/components/home";
import viteConfig from "../vite.config.js";

test("getOptimizedImageUrl injects f_auto,q_auto into raw Cloudinary image URLs", () => {
  const rawUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
  const optimized = getOptimizedImageUrl(rawUrl);

  assert.ok(
    optimized.includes("/image/upload/f_auto,q_auto/sample.jpg"),
    "Must inject f_auto,q_auto transformation into Cloudinary upload path"
  );
});

test("getOptimizedImageUrl supports custom sizing, cropping, and format parameters", () => {
  const rawUrl = "https://res.cloudinary.com/demo/image/upload/v12345/hero.png";
  const optimized = getOptimizedImageUrl(rawUrl, {
    width: 800,
    height: 450,
    crop: "fill",
  });

  assert.ok(optimized.includes("w_800"), "Should include width 800");
  assert.ok(optimized.includes("h_450"), "Should include height 450");
  assert.ok(optimized.includes("c_fill"), "Should include fill crop");
  assert.ok(optimized.includes("f_auto"), "Should include auto format");
  assert.ok(optimized.includes("q_auto"), "Should include auto quality");
});

test("getOptimizedImageUrl avoids duplicate transformation injection", () => {
  const alreadyOptimized =
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg";
  const result = getOptimizedImageUrl(alreadyOptimized);

  assert.equal(
    result,
    alreadyOptimized,
    "Should not double-inject f_auto,q_auto when already present"
  );
});

test("getOptimizedImageUrl returns original URL for non-Cloudinary images or placeholders", () => {
  const externalUrl = "https://images.unsplash.com/photo-12345";
  assert.equal(getOptimizedImageUrl(externalUrl), externalUrl);

  assert.ok(
    getOptimizedImageUrl("").includes("terminal-placeholder.png"),
    "Should return terminal placeholder for empty URL"
  );
  assert.ok(
    getOptimizedImageUrl(null).includes("terminal-placeholder.png"),
    "Should return terminal placeholder for null URL"
  );
});

test("Public components apply getOptimizedImageUrl to images", () => {
  // BlogPostPage with cover image
  const postWithCover = {
    title: "Performance Deep Dive",
    slug: "performance-deep-dive",
    cover_image_url: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
    content_markdown: "## Hello",
  };

  const postHtml = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs/performance-deep-dive"] },
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

  // ProjectCard with image
  const projectWithImage = {
    title: "Optimized Project",
    image_url: "https://res.cloudinary.com/demo/image/upload/proj.png",
    tags: ["React"],
  };

  const projectHtml = renderToString(
    React.createElement(ProjectCard, { project: projectWithImage })
  );
  assert.ok(
    projectHtml.includes("/image/upload/c_fill,w_800,f_auto,q_auto/proj.png"),
    "ProjectCard image must use optimized Cloudinary URL"
  );

  // HeroTile with avatar
  const profileWithAvatar = {
    name: "Piyush Bhagwat",
    avatar_url: "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
  };

  const heroHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(HeroTile, { profile: profileWithAvatar })
    )
  );
  assert.ok(
    heroHtml.includes("/image/upload/c_fill,w_250,h_250,f_auto,q_auto/avatar.jpg"),
    "HeroTile avatar must use optimized Cloudinary URL"
  );
});

test("vite.config.js manualChunks separates vendor chunks for optimized code-splitting", () => {
  const manualChunks = viteConfig.build?.rollupOptions?.output?.manualChunks;
  assert.ok(
    typeof manualChunks === "function",
    "manualChunks must be configured as a function in vite.config.js"
  );

  assert.equal(manualChunks("node_modules/firebase/firestore/index.js"), "vendor-firebase");
  assert.equal(manualChunks("node_modules/react-markdown/lib/index.js"), "vendor-markdown");
  assert.equal(manualChunks("node_modules/remark-gfm/index.js"), "vendor-markdown");
  assert.equal(manualChunks("node_modules/framer-motion/dist/es/index.js"), "vendor-framer-motion");
  assert.equal(manualChunks("node_modules/lucide-react/dist/esm/index.js"), "vendor-icons");
  assert.equal(manualChunks("node_modules/react/index.js"), "vendor-core");
});

test("App.jsx no longer imports legacy CSS stylesheets", () => {
  const appFile = fs.readFileSync(path.resolve("src/App.jsx"), "utf-8");
  assert.ok(
    !appFile.includes("main.style.css"),
    "App.jsx should no longer import legacy main.style.css"
  );
  assert.ok(
    !appFile.includes("mobile.style.css"),
    "App.jsx should no longer import legacy mobile.style.css"
  );
});
