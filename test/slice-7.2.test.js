import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../src/pages/public/HomePage.jsx";
import BrutalButton from "../src/components/brutalist/BrutalButton.jsx";
import {
  HeroTile,
  StatusTile,
  SocialsTile,
  SkillsTile,
  LatestBlogTile,
  FeaturedProjectsTile,
} from "../src/components/home";
import { DEFAULT_PROFILE } from "../src/pages/admin/ProfileCMS.jsx";
import { DEFAULT_SKILLS } from "../src/pages/admin/SkillsCMS.jsx";
import { DEFAULT_PROJECTS } from "../src/pages/admin/ProjectsCMS.jsx";
import { SAMPLE_INITIAL_POST } from "../src/pages/admin/BlogsCMS.jsx";

test("BrutalButton includes tactile active translation and shadow reset classes", () => {
  const html = renderToString(
    React.createElement(BrutalButton, { variant: "primary" }, "Click Me")
  );

  assert.ok(
    html.includes("active:translate-x-[2px]") && html.includes("active:translate-y-[2px]"),
    "BrutalButton must have tactile active:translate-x-[2px] and active:translate-y-[2px]"
  );
  assert.ok(
    html.includes("active:shadow-none"),
    "BrutalButton must clear shadow on active press"
  );
});

test("SocialsTile links include tactile active click offsets and shadow", () => {
  const html = renderToString(
    React.createElement(SocialsTile, { profile: DEFAULT_PROFILE })
  );

  assert.ok(
    html.includes("active:translate-x-[2px]"),
    "SocialsTile links must have active:translate-x-[2px]"
  );
  assert.ok(
    html.includes("active:shadow-none"),
    "SocialsTile links must have active:shadow-none"
  );
});

test("SkillsTile badges include tactile active click offsets and hover effects", () => {
  const html = renderToString(
    React.createElement(SkillsTile, { skills: DEFAULT_SKILLS })
  );

  assert.ok(
    html.includes("active:translate-x-[2px]"),
    "SkillsTile badges must have active:translate-x-[2px]"
  );
  assert.ok(
    html.includes("hover:-translate-y-0.5"),
    "SkillsTile badges must lift subtly on hover"
  );
});

test("LatestBlogTile and FeaturedProjectsTile include hover lift transitions", () => {
  const blogHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(LatestBlogTile, { post: SAMPLE_INITIAL_POST })
    )
  );
  assert.ok(
    blogHtml.includes("hover:-translate-y-0.5"),
    "LatestBlogTile must have hover:-translate-y-0.5"
  );

  const projectsHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(FeaturedProjectsTile, {
        projects: DEFAULT_PROJECTS,
        onOpenCaseStudy: () => {},
      })
    )
  );
  assert.ok(
    projectsHtml.includes("hover:-translate-y-0.5"),
    "FeaturedProjectsTile cards must have hover:-translate-y-0.5"
  );
});

test("HomePage renders motion-animated bento container with responsive 1-col, 2-col, and 4-col classes", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(HomePage)
    )
  );

  // Responsive grid breakpoints
  assert.ok(
    html.includes("grid-cols-1"),
    "Bento grid must support single-column layout on mobile"
  );
  assert.ok(
    html.includes("md:grid-cols-2"),
    "Bento grid must support 2-column layout on tablet"
  );
  assert.ok(
    html.includes("lg:grid-cols-4"),
    "Bento grid must support 4-column layout on desktop"
  );

  // Responsive tile spans
  assert.ok(
    html.includes("lg:col-span-2"),
    "Hero and Skills tiles must span 2 columns on desktop"
  );
  assert.ok(
    html.includes("lg:col-span-4"),
    "Featured Projects and Publication banner must span full width on desktop"
  );

  // All 6 tiles successfully rendered within motion wrappers
  assert.ok(html.includes("whoami"), "HeroTile present in animated grid");
  assert.ok(html.includes("Telemetry"), "StatusTile present in animated grid");
  assert.ok(html.includes("Links &amp; Dock") || html.includes("Links & Dock"), "SocialsTile present in animated grid");
  assert.ok(html.includes("Tech Stack &amp; Skills") || html.includes("Tech Stack & Skills"), "SkillsTile present in animated grid");
  assert.ok(html.includes("Latest Publication"), "LatestBlogTile present in animated grid");
  assert.ok(html.includes("Featured Systems &amp; Deployments") || html.includes("Featured Systems & Deployments"), "FeaturedProjectsTile present in animated grid");
});
