import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGACY_PROJECTS,
  getNormalizedLegacyProjects,
  migrateLegacyProjects,
} from "../src/scripts/migrateLegacyProjects.js";
import {
  seedProjects,
  SEED_PROJECTS,
} from "../src/scripts/seedData.js";

test("LEGACY_PROJECTS schema, completeness and case studies", () => {
  assert.equal(LEGACY_PROJECTS.length, 6, "Must contain all 6 legacy projects from src/projects.js");

  const normalized = getNormalizedLegacyProjects();
  assert.equal(normalized.length, 6, "getNormalizedLegacyProjects must return 6 projects");

  // Verify Notes Pool with full case study
  const notesPool = LEGACY_PROJECTS.find((p) => p.slug === "notes-pool");
  assert.ok(notesPool, "Notes Pool project must be present");
  assert.equal(notesPool.title, "Notes Pool");
  assert.equal(notesPool.live_url, "https://notespool.netlify.app/");
  assert.ok(notesPool.case_study, "Must have case_study object");
  assert.equal(notesPool.case_study.enabled, true, "Case study must be enabled");
  assert.ok(
    notesPool.case_study.why.includes("Motivated by the absence of an organized system"),
    "Must preserve motivation why text"
  );
  assert.ok(
    notesPool.case_study.tech_stack.includes("ReactJS"),
    "Must include ReactJS in case study tech stack"
  );
  assert.ok(
    notesPool.case_study.learnings.includes("File Saving"),
    "Must include File Saving in case study learnings"
  );
  assert.equal(notesPool.case_study.problems.length, 1, "Must contain render.com problem challenge");
  assert.ok(
    notesPool.case_study.problems[0].que.includes("render.com"),
    "Must have render.com question"
  );
  assert.ok(
    notesPool.case_study.problems[0].ans.includes("config.env"),
    "Must have config.env solution"
  );

  // Verify Dictionary with case study
  const dict = LEGACY_PROJECTS.find((p) => p.slug === "dictionary");
  assert.ok(dict, "Dictionary project must be present");
  assert.equal(dict.case_study.enabled, true);
  assert.ok(dict.case_study.why.includes("dictionary web application"));
  assert.ok(dict.case_study.learnings.includes("APIs"));

  // Verify Flash Card with case study
  const flashCard = LEGACY_PROJECTS.find((p) => p.slug === "flash-card");
  assert.ok(flashCard, "Flash Card project must be present");
  assert.equal(flashCard.case_study.enabled, true);
  assert.ok(flashCard.case_study.why.includes("using ReactJS"));

  // Verify other projects (Banquet Hall, Elementrix, Transportation Problem)
  const banquet = LEGACY_PROJECTS.find((p) => p.slug === "banquet-hall");
  assert.ok(banquet, "Banquet Hall must be present");
  assert.equal(banquet.case_study.enabled, false);

  const elementrix = LEGACY_PROJECTS.find((p) => p.slug === "elementrix-website");
  assert.ok(elementrix, "Elementrix Website must be present");

  const transport = LEGACY_PROJECTS.find((p) => p.slug === "transportation-problem-solver");
  assert.ok(transport, "Transportation Problem Solver must be present");
});

test("seedData exports seedProjects and SEED_PROJECTS", () => {
  assert.equal(typeof seedProjects, "function", "seedProjects must be exported as a function");
  assert.ok(Array.isArray(SEED_PROJECTS), "SEED_PROJECTS must be an array");
  assert.equal(SEED_PROJECTS.length, 6, "SEED_PROJECTS must contain 6 items");
});

test("migrateLegacyProjects function signature and options", () => {
  assert.equal(typeof migrateLegacyProjects, "function", "migrateLegacyProjects must be a function");
});
