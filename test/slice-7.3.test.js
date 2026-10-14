import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  getOptimizedImageUrl,
  validateImageFile,
  CLOUDINARY_CONFIG,
} from "../src/services/cloudinary.js";
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
    heroHtml.includes("/image/upload/c_fill,w_400,h_400,f_auto,q_auto/avatar.jpg"),
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

test("CLOUDINARY_CONFIG provides valid cloudName and uploadPreset fallback defaults", () => {
  assert.ok(CLOUDINARY_CONFIG.cloudName, "cloudName must not be empty");
  assert.ok(CLOUDINARY_CONFIG.uploadPreset, "uploadPreset must not be empty");
  assert.ok(Array.isArray(CLOUDINARY_CONFIG.allowedTypes), "allowedTypes must be an array");
  assert.ok(CLOUDINARY_CONFIG.allowedTypes.includes("image/jpeg"));
  assert.ok(CLOUDINARY_CONFIG.allowedTypes.includes("image/jpg"));
  assert.ok(CLOUDINARY_CONFIG.allowedTypes.includes("image/png"));
});

test("validateImageFile validates image formats and sizes flexibly", () => {
  // Valid MIME type
  assert.equal(
    validateImageFile({ type: "image/png", size: 1024 * 1024, name: "avatar.png" }).valid,
    true
  );
  // Valid by extension even if type is unusual
  assert.equal(
    validateImageFile({ type: "image/jpg", size: 2 * 1024 * 1024, name: "photo.jpg" }).valid,
    true
  );
  assert.equal(
    validateImageFile({ type: "", size: 500 * 1024, name: "avatar.WEBP" }).valid,
    true
  );
  // Rejects invalid extension/type
  assert.equal(
    validateImageFile({ type: "application/pdf", size: 500, name: "resume.pdf" }).valid,
    false
  );
  // Rejects oversized file (> 5MB)
  assert.equal(
    validateImageFile({ type: "image/png", size: 6 * 1024 * 1024, name: "huge.png" }).valid,
    false
  );
});

test("Netlify SPA configuration provides 200 rewrite for client-side routing", () => {
  const redirectsPath = path.resolve("public/_redirects");
  assert.ok(fs.existsSync(redirectsPath), "public/_redirects must exist for Netlify routing");
  const redirectsContent = fs.readFileSync(redirectsPath, "utf-8");
  assert.match(
    redirectsContent,
    /\/\*\s+\/index\.html\s+200/,
    "public/_redirects must rewrite all routes (/*) to /index.html with status 200"
  );

  const netlifyTomlPath = path.resolve("netlify.toml");
  assert.ok(fs.existsSync(netlifyTomlPath), "netlify.toml must exist for build & redirect configuration");
  const netlifyTomlContent = fs.readFileSync(netlifyTomlPath, "utf-8");
  assert.ok(
    netlifyTomlContent.includes('from = "/*"') &&
    netlifyTomlContent.includes('to = "/index.html"') &&
    netlifyTomlContent.includes("status = 200"),
    "netlify.toml must specify SPA 200 redirect rule"
  );
});


