import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import SkillsCMS, { DEFAULT_SKILLS } from "../src/pages/admin/SkillsCMS.jsx";
import SkillEditorModal from "../src/pages/admin/SkillEditorModal.jsx";

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

test("DEFAULT_SKILLS schema & categories", () => {
  assert.ok(Array.isArray(DEFAULT_SKILLS), "DEFAULT_SKILLS must be an array");
  assert.ok(DEFAULT_SKILLS.length >= 8, "Must contain at least 8 initial skills");

  const categories = new Set(DEFAULT_SKILLS.map((s) => s.category));
  assert.ok(categories.has("frontend"), "Must include frontend skills");
  assert.ok(categories.has("backend"), "Must include backend skills");
  assert.ok(categories.has("database"), "Must include database skills");
  assert.ok(categories.has("tools"), "Must include tools skills");

  DEFAULT_SKILLS.forEach((skill) => {
    assert.ok(skill.name, "Skill must have a name");
    assert.ok(typeof skill.order === "number", "Skill must have a numeric order");
    assert.ok(typeof skill.featured === "boolean", "Skill must have featured boolean");
  });
});

test("SkillEditorModal rendering states", () => {
  // When closed
  const closedHtml = renderToString(
    React.createElement(SkillEditorModal, {
      isOpen: false,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.equal(closedHtml, "", "Modal should render nothing when isOpen is false");

  // When open for new skill
  const openNewHtml = renderToString(
    React.createElement(SkillEditorModal, {
      isOpen: true,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openNewHtml.includes("Add New Skill"), "Should render Add New Skill title");
  assert.ok(openNewHtml.includes("Skill Name *"), "Should contain Skill Name label");
  assert.ok(openNewHtml.includes("Category"), "Should contain Category label");
  assert.ok(openNewHtml.includes("Sort Order"), "Should contain Sort Order label");
  assert.ok(openNewHtml.includes("Featured on Homepage"), "Should contain Featured option");

  // When open for edit
  const openEditHtml = renderToString(
    React.createElement(SkillEditorModal, {
      isOpen: true,
      skill: {
        id: "react",
        name: "React JS",
        category: "frontend",
        order: 1,
        featured: true,
      },
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openEditHtml.includes("Edit Skill"), "Should render Edit Skill title");
  assert.ok(openEditHtml.includes("React JS"), "Should display skill name");
});

test("SkillsCMS renders category tabs, actions, and skill cards", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/skills"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(SkillsCMS)
      )
    )
  );

  // Header & Title
  assert.ok(
    html.includes("Skills &amp; Tech Stack CMS") || html.includes("Skills & Tech Stack CMS"),
    "Should render Skills & Tech Stack CMS header"
  );
  assert.ok(html.includes("sys.cms.skills --manage"), "Should render terminal command");
  assert.ok(html.includes("Add Skill"), "Should render Add Skill action button");
  assert.ok(html.includes("Seed Defaults"), "Should render Seed Defaults action button");

  // Category Filter Tabs
  assert.ok(html.includes("All Skills"), "Should contain All Skills tab");
  assert.ok(html.includes("Frontend"), "Should contain Frontend tab");
  assert.ok(html.includes("Backend"), "Should contain Backend tab");
  assert.ok(html.includes("Database"), "Should contain Database tab");
  assert.ok(html.includes("Tools"), "Should contain Tools tab");

  // Initial Skills Cards
  assert.ok(html.includes("React JS"), "Should render React JS skill card");
  assert.ok(html.includes("Node JS"), "Should render Node JS skill card");
  assert.ok(html.includes("MongoDB"), "Should render MongoDB skill card");
});
