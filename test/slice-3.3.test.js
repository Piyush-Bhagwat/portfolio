import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import ExperienceCMS, { DEFAULT_EXPERIENCES } from "../src/pages/admin/ExperienceCMS.jsx";
import ExperienceEditorModal from "../src/pages/admin/ExperienceEditorModal.jsx";

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

test("DEFAULT_EXPERIENCES schema and milestones", () => {
  assert.ok(Array.isArray(DEFAULT_EXPERIENCES), "DEFAULT_EXPERIENCES must be an array");
  assert.ok(DEFAULT_EXPERIENCES.length >= 3, "Must contain at least 3 career milestones");

  DEFAULT_EXPERIENCES.forEach((exp) => {
    assert.ok(exp.id, "Experience milestone must have an ID");
    assert.ok(exp.role, "Experience milestone must have a role");
    assert.ok(exp.company, "Experience milestone must have a company");
    assert.ok(exp.period, "Experience milestone must have a period");
    assert.ok(typeof exp.order === "number", "Experience milestone must have a numeric order");
    assert.ok(Array.isArray(exp.skills_used), "skills_used must be an array");
    assert.ok(exp.skills_used.length > 0, "Must have at least one skill tagged");
  });
});

test("ExperienceEditorModal rendering states", () => {
  // When closed
  const closedHtml = renderToString(
    React.createElement(ExperienceEditorModal, {
      isOpen: false,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.equal(closedHtml, "", "Modal should render nothing when isOpen is false");

  // When open for adding a milestone
  const openNewHtml = renderToString(
    React.createElement(ExperienceEditorModal, {
      isOpen: true,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openNewHtml.includes("Add Career Milestone"), "Should render Add Career Milestone title");
  assert.ok(openNewHtml.includes("Role / Position Title *"), "Should contain Role label");
  assert.ok(openNewHtml.includes("Company / Organization *"), "Should contain Company label");
  assert.ok(openNewHtml.includes("Period / Dates *"), "Should contain Period label");
  assert.ok(openNewHtml.includes("Key Skills"), "Should contain Key Skills section");

  // When open for editing an existing milestone
  const openEditHtml = renderToString(
    React.createElement(ExperienceEditorModal, {
      isOpen: true,
      experience: {
        id: "full-stack-dev",
        role: "Senior Full Stack Architect",
        company: "Acme Labs",
        period: "2024 - Present",
        location: "Remote",
        description: "Leading frontend and backend development teams.",
        skills_used: ["React", "TypeScript", "Node.js"],
        order: 1,
      },
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openEditHtml.includes("Edit Career Milestone"), "Should render Edit Career Milestone title");
  assert.ok(openEditHtml.includes("Senior Full Stack Architect"), "Should contain milestone role value");
  assert.ok(openEditHtml.includes("Acme Labs"), "Should contain milestone company value");
  assert.ok(openEditHtml.includes("TypeScript"), "Should render skill badge in edit mode");
});

test("ExperienceCMS renders header, action controls, and chronological milestones", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/experience"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(ExperienceCMS)
      )
    )
  );

  // Header & Terminal prompt
  assert.ok(
    html.includes("Work Experience &amp; Milestones CMS") ||
      html.includes("Work Experience & Milestones CMS"),
    "Should render Work Experience & Milestones CMS header"
  );
  assert.ok(
    html.includes("sys.cms.experience --timeline"),
    "Should render terminal command prompt"
  );
  assert.ok(html.includes("Add Milestone"), "Should render Add Milestone button");
  assert.ok(html.includes("Seed Defaults"), "Should render Seed Defaults button");

  // Default milestones rendered
  assert.ok(html.includes("Full Stack Developer"), "Should display Full Stack Developer milestone");
  assert.ok(
    html.includes("Freelance &amp; Independent Consulting") ||
      html.includes("Freelance & Independent Consulting"),
    "Should display company name"
  );
  assert.ok(html.includes("Frontend Engineer"), "Should display Frontend Engineer milestone");
  assert.ok(
    html.includes("B.Tech in Computer Science &amp; Engineering") ||
      html.includes("B.Tech in Computer Science & Engineering"),
    "Should display B.Tech academic milestone"
  );

  // Skills and action buttons
  assert.ok(html.includes("Tailwind CSS"), "Should render skill badge");
  assert.ok(html.includes("Edit"), "Should render Edit action button");
  assert.ok(html.includes("Delete"), "Should render Delete action button");
});
