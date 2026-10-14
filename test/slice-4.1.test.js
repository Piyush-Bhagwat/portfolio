import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import ProjectsCMS, { DEFAULT_PROJECTS } from "../src/pages/admin/ProjectsCMS.jsx";
import ProjectEditorModal from "../src/pages/admin/ProjectEditorModal.jsx";

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

test("DEFAULT_PROJECTS schema and data integrity", () => {
  assert.ok(Array.isArray(DEFAULT_PROJECTS), "DEFAULT_PROJECTS must be an array");
  assert.equal(DEFAULT_PROJECTS.length, 6, "Must contain all 6 legacy projects");

  DEFAULT_PROJECTS.forEach((proj) => {
    assert.ok(proj.id, "Project must have an ID");
    assert.ok(proj.title, "Project must have a title");
    assert.ok(proj.slug, "Project must have a slug");
    assert.ok(proj.description, "Project must have a description");
    assert.ok(Array.isArray(proj.tags), "tags must be an array");
    assert.ok(proj.tags.length > 0, "Project must have at least one tech tag");
    assert.ok(typeof proj.order === "number", "Project must have numeric order");
    assert.ok(typeof proj.featured === "boolean", "Project must have featured boolean");
  });

  const featuredProjects = DEFAULT_PROJECTS.filter((p) => p.featured);
  assert.ok(featuredProjects.length >= 3, "At least 3 projects should be featured by default");
});

test("ProjectEditorModal rendering states", () => {
  // When closed
  const closedHtml = renderToString(
    React.createElement(ProjectEditorModal, {
      isOpen: false,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.equal(closedHtml, "", "Modal should render nothing when isOpen is false");

  // When open for new project
  const openNewHtml = renderToString(
    React.createElement(ProjectEditorModal, {
      isOpen: true,
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openNewHtml.includes("Add New Project"), "Should render Add New Project title");
  assert.ok(openNewHtml.includes("Project Title *"), "Should contain Project Title label");
  assert.ok(openNewHtml.includes("Slug (URL-safe) *"), "Should contain Slug label");
  assert.ok(openNewHtml.includes("Short Description *"), "Should contain Short Description label");
  assert.ok(openNewHtml.includes("Live Demo URL"), "Should contain Live Demo URL label");
  assert.ok(openNewHtml.includes("GitHub Repository URL"), "Should contain GitHub URL label");
  assert.ok(openNewHtml.includes("Featured (Bento)"), "Should contain Featured toggle option");

  // When open for editing existing project
  const openEditHtml = renderToString(
    React.createElement(ProjectEditorModal, {
      isOpen: true,
      project: {
        id: "notes-pool",
        title: "Notes Pool",
        slug: "notes-pool",
        description: "Study material repository for BCA students.",
        tags: ["React", "Firebase", "Node.js"],
        live_url: "https://notespool.netlify.app/",
        github_url: "https://github.com/Piyush-Bhagwat",
        featured: true,
        date: "2024",
        order: 1,
      },
      onClose: () => {},
      onSave: () => {},
    })
  );
  assert.ok(openEditHtml.includes("Edit Project Record"), "Should render Edit Project title");
  assert.ok(openEditHtml.includes("Notes Pool"), "Should display project title");
  assert.ok(openEditHtml.includes("notes-pool"), "Should display project slug");
  assert.ok(openEditHtml.includes("Firebase"), "Should display tagged tech stack");
});

test("ProjectsCMS renders header, search, filter tabs, and project cards", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/projects"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(ProjectsCMS)
      )
    )
  );

  // Header & Controls
  assert.ok(
    html.includes("Projects &amp; Case Studies CMS") ||
      html.includes("Projects & Case Studies CMS"),
    "Should render Projects & Case Studies CMS header"
  );
  assert.ok(html.includes("sys.cms.projects --inventory"), "Should render terminal command");
  assert.ok(html.includes("Add Project"), "Should render Add Project button");
  assert.ok(html.includes("Seed Defaults"), "Should render Seed Defaults button");

  // Search & Filter Tabs
  assert.ok(html.includes("Search projects by title"), "Should render search input");
  assert.ok(html.includes("All (6)"), "Should render All filter button with count");
  assert.ok(html.includes("Featured (3)"), "Should render Featured filter button with count");
  assert.ok(html.includes("Case Studies (3)"), "Should render Case Studies filter button with count");

  // Project Cards
  assert.ok(html.includes("Notes Pool"), "Should display Notes Pool card");
  assert.ok(html.includes("Dictionary"), "Should display Dictionary card");
  assert.ok(html.includes("Flash Card"), "Should display Flash Card card");
  assert.ok(html.includes("Banquet Hall"), "Should display Banquet Hall card");
  assert.ok(html.includes("Elementrix Website"), "Should display Elementrix Website card");
  assert.ok(html.includes("Transportation Problem Solver"), "Should display Transportation Problem card");

  // Card Controls
  assert.ok(html.includes("Edit"), "Should render Edit button");
  assert.ok(html.includes("Delete"), "Should render Delete button");
  assert.ok(html.includes("Featured"), "Should render Featured badge toggle");
});
