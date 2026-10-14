import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProjectCard, CaseStudyModal } from "../src/components/project";
import ProjectsPage from "../src/pages/public/ProjectsPage.jsx";
import { MainContent } from "../src/App.jsx";

const sampleProject = {
  id: "notes-pool",
  title: "Notes Pool",
  slug: "notes-pool",
  description: "Online study material saving and discovery webapp for BCA students.",
  tags: ["React", "Firebase", "File Storage"],
  live_url: "https://notespool.netlify.app/",
  github_url: "https://github.com/Piyush-Bhagwat",
  image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  featured: true,
  date: "2024",
  case_study: {
    why: "Motivated by the absence of an organized system for storing study materials in our educational institution.",
    tech_stack: ["ReactJS", "Firebase", "Node.js"],
    learnings: ["File Saving", "CORS Configuration"],
    problems: [
      {
        que: "How to deploy environment variables safely in production",
        ans: "Do not expose secret env files to GitHub. Use host secret files and environment variable injection.",
      },
    ],
  },
};

test("ProjectCard renders title, description, tags, and action buttons", () => {
  const html = renderToString(
    React.createElement(ProjectCard, {
      project: sampleProject,
      featured: true,
      onOpenCaseStudy: () => {},
    })
  );

  // Core information
  assert.ok(html.includes("Notes Pool"), "Should render project title");
  assert.ok(html.includes("Online study material saving and discovery"), "Should render description");
  assert.ok(html.includes("2024"), "Should display project year");
  assert.ok(html.includes("Featured"), "Should display Featured badge");
  assert.ok(html.includes("Case Study"), "Should display Case Study badge overlay");

  // Links
  assert.ok(html.includes("Live Demo"), "Should render Live Demo button");
  assert.ok(html.includes("https://notespool.netlify.app/"), "Should include live URL");
  assert.ok(html.includes("https://github.com/Piyush-Bhagwat"), "Should include GitHub repo URL");

  // Read Case Study trigger
  assert.ok(html.includes("Read Case Study"), "Should render Read Case Study button");

  // Tags
  assert.ok(html.includes("React"), "Should render React tag badge");
  assert.ok(html.includes("Firebase"), "Should render Firebase tag badge");
});

test("ProjectCard renders terminal placeholder when no image is provided", () => {
  const noImageProject = {
    ...sampleProject,
    image_url: "",
  };

  const html = renderToString(
    React.createElement(ProjectCard, {
      project: noImageProject,
      onOpenCaseStudy: () => {},
    })
  );

  assert.ok(html.includes("sys.preview.exec"), "Should render terminal placeholder watermark");
  assert.ok(html.includes("SOURCE ARCHITECTURE"), "Should render source architecture text");
});

test("CaseStudyModal renders motivation, tech stack, learnings, and challenge accordion", () => {
  const html = renderToString(
    React.createElement(CaseStudyModal, {
      project: sampleProject,
      onClose: () => {},
    })
  );

  // Dialog Accessibility
  assert.ok(html.includes("role=\"dialog\""), "Should have dialog role");
  assert.ok(html.includes("aria-modal=\"true\""), "Should have aria-modal attribute");

  // Header & Title
  assert.ok(html.includes("sys.casestudy.drawer"), "Should display terminal drawer breadcrumb");
  assert.ok(html.includes("Notes Pool"), "Should render project title in drawer");
  assert.ok(html.includes("Deployed: 2024"), "Should render deployment date");

  // Section 1: Motivation
  assert.ok(html.includes("Motivation &amp; Problem Statement") || html.includes("Motivation & Problem Statement"), "Should render motivation header");
  assert.ok(html.includes("Motivated by the absence of an organized system"), "Should render case study why statement");

  // Section 2: Architecture & Learnings
  assert.ok(html.includes("Architectural Decisions &amp; Tech Breakdown") || html.includes("Architectural Decisions & Tech Breakdown"), "Should render architecture header");
  assert.ok(html.includes("ReactJS"), "Should render tech stack badge");
  assert.ok(html.includes("File Saving"), "Should render learning takeaway");
  assert.ok(html.includes("CORS Configuration"), "Should render CORS learning");

  // Section 3: Expandable Challenge Accordion
  assert.ok(html.includes("Challenges Encountered &amp; Resolutions") || html.includes("Challenges Encountered & Resolutions"), "Should render challenges header");
  assert.ok(html.includes("Q1"), "Should render challenge index pill");
  assert.ok(html.includes("How to deploy environment variables safely in production"), "Should render challenge question");
  assert.ok(html.includes("Do not expose secret env files to GitHub"), "Should render resolution text for expanded challenge");
});

test("ProjectsPage renders hero header, search input, filter pills, and default projects", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/projects"] },
      React.createElement(ProjectsPage)
    )
  );

  // Hero Section
  assert.ok(html.includes("sys.projects.engineering_portfolio"), "Should render terminal breadcrumb");
  assert.ok(html.includes("Engineered Applications &amp; Projects") || html.includes("Engineered Applications & Projects"), "Should render main title");
  assert.ok(html.includes("Total Projects"), "Should render project count telemetry");
  assert.ok(html.includes("Deep-Dive Case Studies"), "Should render case studies count");

  // Filter & Search Controls
  assert.ok(html.includes("Search projects by name, technology, or keywords..."), "Should render search input");
  assert.ok(html.includes("Featured"), "Should render Featured filter tab");
  assert.ok(html.includes("Case Studies"), "Should render Case Studies filter tab");
  assert.ok(html.includes("All Stacks"), "Should render All Stacks filter pill");

  // Initial projects rendered
  assert.ok(html.includes("Notes Pool"), "Should render Notes Pool card");
  assert.ok(html.includes("Dictionary"), "Should render Dictionary card");
  assert.ok(html.includes("Flash Card"), "Should render Flash Card card");
});

test("App routing mounts ProjectsPage at /projects", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/projects"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(html.includes("Engineered Applications &amp; Projects") || html.includes("Engineered Applications & Projects"), "App should render ProjectsPage at /projects");
  assert.ok(html.includes("sys.projects.engineering_portfolio"), "Should display projects engineering portfolio");
});
