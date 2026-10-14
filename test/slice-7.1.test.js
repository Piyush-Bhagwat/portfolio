import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import {
  HeroTile,
  StatusTile,
  SocialsTile,
  SkillsTile,
  LatestBlogTile,
  FeaturedProjectsTile,
} from "../src/components/home";
import { PublicNavbar, PublicFooter } from "../src/components/layout";
import HomePage from "../src/pages/public/HomePage.jsx";
import { MainContent } from "../src/App.jsx";
import { DEFAULT_PROFILE } from "../src/pages/admin/ProfileCMS.jsx";
import { DEFAULT_SKILLS } from "../src/pages/admin/SkillsCMS.jsx";
import { DEFAULT_PROJECTS } from "../src/pages/admin/ProjectsCMS.jsx";
import { SAMPLE_INITIAL_POST } from "../src/pages/admin/BlogsCMS.jsx";

test("HeroTile renders whoami terminal prompt, profile details, and CTA buttons", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(HeroTile, { profile: DEFAULT_PROFILE })
    )
  );

  assert.ok(html.includes("whoami"), "Should render whoami terminal command");
  assert.ok(html.includes("Piyush Bhagwat"), "Should render profile name");
  assert.ok(html.includes("Full Stack Developer"), "Should render engineer role");
  assert.ok(html.includes("Explore Projects"), "Should render Explore Projects CTA");
  assert.ok(html.includes("Read Articles"), "Should render Read Articles CTA");
  assert.ok(html.includes("Say Hello"), "Should render Say Hello CTA");
});

test("StatusTile renders telemetry header, availability pill, IST time, and location", () => {
  const html = renderToString(
    React.createElement(StatusTile, { profile: DEFAULT_PROFILE })
  );

  assert.ok(html.includes("Telemetry"), "Should render Telemetry header");
  assert.ok(html.includes("NODE: IST"), "Should render IST node badge");
  assert.ok(html.includes("Available for new opportunities"), "Should render availability status");
  assert.ok(html.includes("IST"), "Should render IST timezone label");
  assert.ok(html.includes("Brahmapuri, Maharashtra, India"), "Should render location");
});

test("SocialsTile renders monospace link dock with GitHub, LinkedIn, X, and Resume", () => {
  const html = renderToString(
    React.createElement(SocialsTile, { profile: DEFAULT_PROFILE })
  );

  assert.ok(html.includes("Links &amp; Dock") || html.includes("Links & Dock"), "Should render Links & Dock header");
  assert.ok(html.includes("GitHub"), "Should include GitHub link");
  assert.ok(html.includes("LinkedIn"), "Should include LinkedIn link");
  assert.ok(html.includes("X / Twitter"), "Should include X / Twitter link");
  assert.ok(html.includes("Resume"), "Should include Resume link");
  assert.ok(html.includes("https://github.com/Piyush-Bhagwat"), "Should have GitHub URL");
});

test("SkillsTile renders category filters and dynamic skill badges", () => {
  const html = renderToString(
    React.createElement(SkillsTile, { skills: DEFAULT_SKILLS })
  );

  assert.ok(html.includes("Tech Stack &amp; Skills") || html.includes("Tech Stack & Skills"), "Should render Tech Stack header");
  assert.ok(html.includes("All Tech"), "Should render All Tech filter pill");
  assert.ok(html.includes("Frontend"), "Should render Frontend filter pill");
  assert.ok(html.includes("Backend"), "Should render Backend filter pill");
  assert.ok(html.includes("React JS"), "Should render React JS badge");
  assert.ok(html.includes("Node JS"), "Should render Node JS badge");
});

test("LatestBlogTile renders article title, read time, and direct publication link", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(LatestBlogTile, { post: SAMPLE_INITIAL_POST })
    )
  );

  assert.ok(html.includes("Latest Publication"), "Should render Latest Publication header");
  assert.ok(html.includes("Building Resilient Web Interfaces with Neo-Brutalism"), "Should render article title");
  assert.ok(html.includes("min read"), "Should display read time telemetry");
  assert.ok(html.includes("Read Full Article"), "Should render Read Full Article link");
  assert.ok(html.includes("/blogs/building-resilient-web-interfaces"), "Should link to article slug");
});

test("FeaturedProjectsTile renders top featured cards and case study triggers", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(FeaturedProjectsTile, {
        projects: DEFAULT_PROJECTS,
        onOpenCaseStudy: () => {},
      })
    )
  );

  assert.ok(html.includes("Featured Systems &amp; Deployments") || html.includes("Featured Systems & Deployments"), "Should render Featured Systems header");
  assert.ok(html.includes("Notes Pool"), "Should render top featured project Notes Pool");
  assert.ok(html.includes("Case Study"), "Should render Case Study button");
  assert.ok(html.includes("Browse All"), "Should render link to browse all projects");
});

test("PublicNavbar and PublicFooter render accessible navigation and branding", () => {
  const navHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(PublicNavbar)
    )
  );

  assert.ok(navHtml.includes("piyush.bhagwat"), "Navbar should display engineer brand name");
  assert.ok(navHtml.includes("Home"), "Navbar should have Home link");
  assert.ok(navHtml.includes("Projects"), "Navbar should have Projects link");
  assert.ok(navHtml.includes("Articles"), "Navbar should have Articles link");
  assert.ok(navHtml.includes("Contact Me"), "Navbar should have Contact CTA");

  const footerHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(PublicFooter)
    )
  );

  assert.ok(
    footerHtml.includes("Have an architecture or project in mind") ||
      footerHtml.includes("Ready to Collaborate"),
    "Footer should render CTA"
  );
  assert.ok(footerHtml.includes("piyushbhagwat5@gmail.com"), "Footer should render email address");
  assert.ok(footerHtml.includes("+91 93099861442"), "Footer should render phone number");
  assert.ok(footerHtml.includes("Brahmapuri, Maharashtra, India"), "Footer should render location");
});

test("HomePage renders complete 6-Tile Bento Grid architecture", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(HomePage)
    )
  );

  // Tile 1: Hero
  assert.ok(html.includes("whoami"), "Bento grid must contain HeroTile");
  // Tile 2: Status
  assert.ok(html.includes("Telemetry"), "Bento grid must contain StatusTile");
  // Tile 3: Socials Dock
  assert.ok(html.includes("Links &amp; Dock") || html.includes("Links & Dock"), "Bento grid must contain SocialsTile");
  // Tile 4: Tech Stack
  assert.ok(html.includes("Tech Stack &amp; Skills") || html.includes("Tech Stack & Skills"), "Bento grid must contain SkillsTile");
  // Tile 5: Latest Blog
  assert.ok(html.includes("Latest Publication"), "Bento grid must contain LatestBlogTile");
  // Tile 6: Featured Projects
  assert.ok(html.includes("Featured Systems &amp; Deployments") || html.includes("Featured Systems & Deployments"), "Bento grid must contain FeaturedProjectsTile");
});

test("App routing mounts HomePage at root / with PublicNavbar and PublicFooter", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(html.includes("whoami"), "App root / should render HomePage bento grid");
  assert.ok(html.includes("piyush.bhagwat"), "App root / should render PublicNavbar");
  assert.ok(html.includes("Have an architecture or project in mind?") || html.includes("Have an architecture or project in mind"), "App root / should render PublicFooter");
  assert.ok(html.includes("⚠️ Website refactoring under process, expect unusual behaviour."), "App should preserve live warning banner");
});
