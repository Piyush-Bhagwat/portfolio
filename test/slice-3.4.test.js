import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import Overview from "../src/pages/admin/Overview.jsx";
import {
  SEED_PROFILE,
  SEED_SKILLS,
  SEED_EXPERIENCES,
  seedProfile,
  seedSkills,
  seedExperiences,
  seedAllData,
} from "../src/scripts/seedData.js";

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

test("seedData exports and schema validation", () => {
  assert.equal(typeof seedProfile, "function", "seedProfile must be a function");
  assert.equal(typeof seedSkills, "function", "seedSkills must be a function");
  assert.equal(typeof seedExperiences, "function", "seedExperiences must be a function");
  assert.equal(typeof seedAllData, "function", "seedAllData must be a function");

  // SEED_PROFILE
  assert.equal(SEED_PROFILE.name, "Piyush Bhagwat", "Profile name should match V1");
  assert.ok(SEED_PROFILE.role, "Profile must have a role");
  assert.ok(Array.isArray(SEED_PROFILE.bio_paragraphs), "bio_paragraphs must be an array");
  assert.ok(SEED_PROFILE.bio_paragraphs.length >= 2, "Must contain at least 2 bio paragraphs");
  assert.ok(Array.isArray(SEED_PROFILE.socials), "socials must be an array");

  const platforms = SEED_PROFILE.socials.map((s) => s.platform);
  assert.ok(platforms.includes("github"), "Must include GitHub social");
  assert.ok(platforms.includes("linkedin"), "Must include LinkedIn social");
  assert.ok(platforms.includes("x"), "Must include X / Twitter social");
  assert.ok(platforms.includes("instagram"), "Must include Instagram social");

  // SEED_SKILLS
  assert.ok(Array.isArray(SEED_SKILLS), "SEED_SKILLS must be an array");
  assert.ok(SEED_SKILLS.length >= 8, "Must contain at least 8 skills");
  SEED_SKILLS.forEach((s) => {
    assert.ok(s.id, "Skill must have an ID");
    assert.ok(s.name, "Skill must have a name");
    assert.ok(s.category, "Skill must have a category");
    assert.ok(typeof s.order === "number", "Skill must have numeric order");
  });

  // SEED_EXPERIENCES
  assert.ok(Array.isArray(SEED_EXPERIENCES), "SEED_EXPERIENCES must be an array");
  assert.ok(SEED_EXPERIENCES.length >= 3, "Must contain at least 3 career milestones");
});

test("Overview page renders Firestore Seeder controls and updated roadmap", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(Overview)
      )
    )
  );

  // Seeder controls
  assert.ok(
    html.includes("Firestore Initial Data Seeder"),
    "Should render Firestore Initial Data Seeder title"
  );
  assert.ok(
    html.includes("Seed Initial Data"),
    "Should render Seed Initial Data button"
  );
  assert.ok(
    html.includes("Force Overwrite"),
    "Should render Force Overwrite option"
  );

  // Updated 7-day sprint status
  assert.ok(
    html.includes("Day 3 Done") || html.includes("Day 3"),
    "Should display Day 3 completion status"
  );
  assert.ok(
    html.includes("Day 4: Projects"),
    "Should show Day 4 Projects as active/next"
  );
});
