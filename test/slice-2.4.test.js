import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("firestore.rules file structure and security policies", () => {
  const rulesPath = path.join(rootDir, "firestore.rules");
  assert.ok(fs.existsSync(rulesPath), "firestore.rules file must exist");

  const content = fs.readFileSync(rulesPath, "utf8");

  // Version 2 requirement
  assert.match(content, /rules_version\s*=\s*'2';/, "Must specify rules_version = '2'");

  // Admin whitelist helper function
  assert.match(content, /function\s+isAdmin\s*\(\s*\)/, "Must define an isAdmin() helper function");
  assert.match(
    content,
    /request\.auth\s*!=\s*null/,
    "isAdmin must check for non-null request.auth"
  );
  assert.match(
    content,
    /request\.auth\.token\.email\s*==\s*"piyushbhagwat5@gmail\.com"/,
    "isAdmin must restrict access to piyushbhagwat5@gmail.com"
  );

  // Collections access rules
  assert.match(content, /match\s+\/site_config\/{document}/, "Must protect site_config collection");
  assert.match(content, /match\s+\/skills\/{skillId}/, "Must protect skills collection");
  assert.match(content, /match\s+\/experiences\/{expId}/, "Must protect experiences collection");
  assert.match(content, /match\s+\/projects\/{projectId}/, "Must protect projects collection");
  assert.match(content, /match\s+\/blogs\/{blogId}/, "Must protect blogs collection");

  // Public read, admin write logic
  assert.match(content, /allow\s+read:\s*if\s+true;/, "Must allow public reads on public collections");
  assert.match(content, /allow\s+write:\s*if\s+isAdmin\(\);/, "Must restrict writes to isAdmin()");
  assert.match(
    content,
    /resource\.data\.published\s*==\s*true/,
    "Blogs must restrict public read to published articles"
  );
});

test("Firebase CLI deployment configuration", () => {
  const firebaseJsonPath = path.join(rootDir, "firebase.json");
  const firebasercPath = path.join(rootDir, ".firebaserc");

  assert.ok(fs.existsSync(firebaseJsonPath), "firebase.json must exist");
  assert.ok(fs.existsSync(firebasercPath), ".firebaserc must exist");

  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));
  assert.equal(firebaseJson.firestore?.rules, "firestore.rules", "firebase.json must target firestore.rules");

  const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, "utf8"));
  assert.equal(
    firebaserc.projects?.default,
    "portfolio-c6f29",
    ".firebaserc must point to portfolio-c6f29 project"
  );
});
