import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  DEFAULT_SEO,
  escapeHtml,
  getSocialPreviewImageUrl,
  injectMetaIntoHtml,
} from "../src/utils/seo.js";
import { ArticleActionsBar, WhatsAppIcon } from "../src/components/blog";

test("SEO: getSocialPreviewImageUrl handles null, empty, and Cloudinary URLs", () => {
  // 1. Fallback to default
  assert.equal(
    getSocialPreviewImageUrl(""),
    DEFAULT_SEO.defaultImage,
    "Empty URL must return default preview image"
  );
  assert.equal(
    getSocialPreviewImageUrl(null),
    DEFAULT_SEO.defaultImage,
    "Null URL must return default preview image"
  );

  // 2. Cloudinary URL transformation for WhatsApp (< 300KB, JPEG, 1200x630 fill)
  const rawCloudinary =
    "https://res.cloudinary.com/dsdqo228u/image/upload/v1791974281/portfolio/blogs/post-1/cover.png";
  const transformed = getSocialPreviewImageUrl(rawCloudinary);

  assert.ok(
    transformed.includes("w_1200"),
    "Social preview image must specify 1200px width"
  );
  assert.ok(
    transformed.includes("h_630"),
    "Social preview image must specify 630px height"
  );
  assert.ok(
    transformed.includes("c_fill"),
    "Social preview image must use fill crop"
  );
  assert.ok(
    transformed.includes("f_jpg"),
    "Social preview image must enforce JPEG format for universal WhatsApp compatibility"
  );
  assert.ok(
    transformed.includes("q_80"),
    "Social preview image must use quality 80 to ensure file size stays under WhatsApp 300KB limit"
  );

  // 3. External URLs returned as-is
  const external = "https://images.unsplash.com/photo-example.jpg";
  assert.equal(
    getSocialPreviewImageUrl(external),
    external,
    "External non-Cloudinary images should be preserved as-is"
  );
});

test("SEO: escapeHtml protects attribute strings against injection and malformed HTML", () => {
  const unsafe = 'Building "Resilient" & <Scalable> \'Web\' Apps';
  const safe = escapeHtml(unsafe);

  assert.ok(!safe.includes('"'), "Must escape double quotes");
  assert.ok(!safe.includes("<"), "Must escape opening angle bracket");
  assert.ok(!safe.includes(">"), "Must escape closing angle bracket");
  assert.ok(safe.includes("&quot;"), "Must include &quot;");
  assert.ok(safe.includes("&amp;"), "Must include &amp;");
});

test("SEO: injectMetaIntoHtml replaces title and injects WhatsApp/OpenGraph meta tags", () => {
  const baseHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Piyush Bhagwat | Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

  const meta = {
    title: "Understanding Neo-Brutalism in 2026",
    excerpt: "An architectural guide to high-contrast, tactile UI design with zero-runtime tokens.",
    image: "https://res.cloudinary.com/dsdqo228u/image/upload/v1234/blog/cover.jpg",
    url: "https://piyushbhagwat.com/blogs/understanding-neo-brutalism",
    type: "article",
  };

  const output = injectMetaIntoHtml(baseHtml, meta);

  // Check title
  assert.ok(
    output.includes("<title>Understanding Neo-Brutalism in 2026 | Piyush Bhagwat</title>"),
    "Must replace HTML title tag"
  );

  // Check Open Graph tags for WhatsApp
  assert.ok(
    output.includes('property="og:title" content="Understanding Neo-Brutalism in 2026 | Piyush Bhagwat"'),
    "Must include og:title"
  );
  assert.ok(
    output.includes('property="og:description" content="An architectural guide to high-contrast, tactile UI design with zero-runtime tokens."'),
    "Must include og:description with blog excerpt"
  );
  assert.ok(
    output.includes('property="og:image" content="https://res.cloudinary.com/dsdqo228u/image/upload/c_fill,w_1200,h_630,f_jpg,q_80/v1234/blog/cover.jpg"'),
    "Must include optimized Cloudinary JPEG image"
  );
  assert.ok(
    output.includes('property="og:image:width" content="1200"'),
    "Must include og:image:width 1200"
  );
  assert.ok(
    output.includes('property="og:image:height" content="630"'),
    "Must include og:image:height 630"
  );
  assert.ok(
    output.includes('property="og:type" content="article"'),
    "Must set og:type to article"
  );
  assert.ok(
    output.includes('property="og:url" content="https://piyushbhagwat.com/blogs/understanding-neo-brutalism"'),
    "Must set canonical og:url"
  );

  // Check Twitter Cards
  assert.ok(
    output.includes('name="twitter:card" content="summary_large_image"'),
    "Must set twitter:card to summary_large_image"
  );
  assert.ok(
    output.includes('name="twitter:image" content="https://res.cloudinary.com/dsdqo228u/image/upload/c_fill,w_1200,h_630,f_jpg,q_80/v1234/blog/cover.jpg"'),
    "Must set twitter:image"
  );
});

test("SEO: index.html contains default Open Graph and Twitter Card tags", () => {
  const indexHtml = fs.readFileSync(path.resolve("index.html"), "utf-8");

  assert.ok(indexHtml.includes('property="og:title"'), "index.html must have og:title");
  assert.ok(indexHtml.includes('property="og:description"'), "index.html must have og:description");
  assert.ok(indexHtml.includes('property="og:image"'), "index.html must have og:image");
  assert.ok(indexHtml.includes('name="twitter:card"'), "index.html must have twitter:card");
  assert.ok(indexHtml.includes('name="twitter:image"'), "index.html must have twitter:image");
});

test("SEO: netlify.toml and edge functions are configured for /blogs/* link previews", () => {
  const netlifyToml = fs.readFileSync(path.resolve("netlify.toml"), "utf-8");
  assert.ok(
    netlifyToml.includes("[[edge_functions]]"),
    "netlify.toml must define edge_functions"
  );
  assert.ok(
    netlifyToml.includes('path = "/blogs/*"'),
    "netlify.toml edge function path must be /blogs/*"
  );
  assert.ok(
    netlifyToml.includes('function = "og-meta"'),
    "netlify.toml edge function must be og-meta"
  );

  const edgeFuncPath = path.resolve("netlify/edge-functions/og-meta.js");
  assert.ok(
    fs.existsSync(edgeFuncPath),
    "netlify/edge-functions/og-meta.js must exist"
  );
});

test("SEO: ArticleActionsBar renders 'Share on WhatsApp' button with WhatsAppIcon", () => {
  let whatsappTriggered = false;
  const html = renderToString(
    React.createElement(ArticleActionsBar, {
      readTime: 5,
      formattedDate: "Oct 16, 2026",
      ratingAverage: 4.9,
      ratingCount: 12,
      commentCount: 8,
      copiedLink: false,
      onCopyLink: () => {},
      onShareWhatsApp: () => {
        whatsappTriggered = true;
      },
      onShareTwitter: () => {},
      onShareLinkedIn: () => {},
    })
  );

  assert.ok(
    html.includes("Share on WhatsApp"),
    "ArticleActionsBar must render 'Share on WhatsApp' button"
  );
  assert.ok(
    html.includes("Share on X"),
    "ArticleActionsBar must preserve 'Share on X' button"
  );
  assert.ok(
    html.includes("Share on LinkedIn"),
    "ArticleActionsBar must preserve 'Share on LinkedIn' button"
  );
});
