import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import CaseStudyFields from "../src/components/admin/CaseStudyFields.jsx";
import ProjectEditorModal from "../src/pages/admin/ProjectEditorModal.jsx";

test("CaseStudyFields renders disabled toggle state", () => {
  const html = renderToString(
    React.createElement(CaseStudyFields, {
      value: { enabled: false, why: "", tech_stack: [], learnings: [], problems: [] },
      onChange: () => {},
    })
  );

  assert.ok(
    html.includes("Structured Case Study Builder"),
    "Should render case study header"
  );
  assert.ok(
    html.includes("Disabled") || html.includes("DISABLED"),
    "Should display Disabled status"
  );
  assert.ok(
    !html.includes("Motivation &amp; Problem Statement") &&
      !html.includes("Motivation & Problem Statement"),
    "Should not show fields when disabled"
  );
});

test("CaseStudyFields renders all sections when enabled", () => {
  const sampleCaseStudy = {
    enabled: true,
    why: "Lack of centralized study material sharing system for BCA students.",
    tech_stack: [
      { tech: "ReactJS", rationale: "Virtual DOM and high reusability" },
      { tech: "Firebase", rationale: "Real-time sync and zero infrastructure cost" },
    ],
    learnings: ["File Saving", "CORS Configuration", "State Management"],
    problems: [
      {
        que: "How to deploy environment variables safely in production",
        ans: "Do not expose secret env files to GitHub. Use host secret files and environment variable injection.",
      },
    ],
  };

  const html = renderToString(
    React.createElement(CaseStudyFields, {
      value: sampleCaseStudy,
      onChange: () => {},
    })
  );

  assert.ok(
    html.includes("Enabled") || html.includes("ENABLED"),
    "Should display Enabled status"
  );

  // Motivation & Problem Statement
  assert.ok(
    html.includes("Motivation &amp; Problem Statement") ||
      html.includes("Motivation & Problem Statement"),
    "Should render motivation label"
  );
  assert.ok(
    html.includes("Lack of centralized study material"),
    "Should render why value"
  );

  // Tech Stack Rationale
  assert.ok(
    html.includes("Tech Stack Rationale") ||
      html.includes("Tech Stack Rationale (Frameworks &amp; why chosen)"),
    "Should render tech rationale label"
  );
  assert.ok(html.includes("ReactJS"), "Should display tech item");
  assert.ok(
    html.includes("Virtual DOM and high reusability"),
    "Should display tech rationale"
  );
  assert.ok(html.includes("Firebase"), "Should display second tech item");

  // Key Learnings
  assert.ok(
    html.includes("Key Learnings &amp; Insights") ||
      html.includes("Key Learnings & Insights"),
    "Should render learnings label"
  );
  assert.ok(html.includes("CORS Configuration"), "Should display learning tag");
  assert.ok(html.includes("State Management"), "Should display learning tag");

  // Problems / Challenges Q&A
  assert.ok(
    html.includes("Technical Challenges &amp; Solutions") ||
      html.includes("Technical Challenges & Solutions"),
    "Should render challenges label"
  );
  assert.ok(
    html.includes("How to deploy environment variables safely in production"),
    "Should render problem question"
  );
  assert.ok(
    html.includes("Do not expose secret env files to GitHub"),
    "Should render problem answer"
  );
});

test("ProjectEditorModal integrates CaseStudyFields and populates case study data", () => {
  const projectWithCaseStudy = {
    id: "notes-pool",
    title: "Notes Pool",
    slug: "notes-pool",
    description: "Online study material saving and discovery webapp for BCA students.",
    tags: ["React", "Firebase", "File Storage"],
    live_url: "https://notespool.netlify.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    featured: true,
    date: "2024",
    order: 1,
    case_study: {
      enabled: true,
      why: "Motivated by the absence of an organized system for storing study materials.",
      tech_stack: ["ReactJS", "Firebase"],
      learnings: ["File Saving", "CORS Configuration"],
      problems: [
        {
          que: "Deploying secrets safely",
          ans: "Use environment variables.",
        },
      ],
    },
  };

  const html = renderToString(
    React.createElement(ProjectEditorModal, {
      isOpen: true,
      project: projectWithCaseStudy,
      onClose: () => {},
      onSave: () => {},
    })
  );

  // Project details
  assert.ok(html.includes("Notes Pool"), "Should render project title");
  assert.ok(html.includes("notes-pool"), "Should render project slug");

  // Case study builder integration
  assert.ok(
    html.includes("Structured Case Study Builder"),
    "Should render embedded CaseStudyFields builder"
  );
  assert.ok(
    html.includes("Motivated by the absence of an organized system"),
    "Should display why text"
  );
  assert.ok(html.includes("Deploying secrets safely"), "Should display challenge question");
  assert.ok(html.includes("Use environment variables"), "Should display challenge answer");
});
