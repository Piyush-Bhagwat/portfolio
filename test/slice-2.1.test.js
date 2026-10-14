import test from "node:test";
import assert from "node:assert/strict";
import {
  app,
  auth,
  db,
  storage,
  ADMIN_EMAIL,
  isAuthorizedAdmin,
  formatAuthErrorMessage,
  loginWithEmail,
  logoutAdmin,
  resetAdminPassword,
  subscribeToAuthState,
} from "../src/services/firebase.js";
import { db as legacyDb, store as legacyStore, getProjects } from "../src/db/firebase.db.js";

test("Firebase Service Initialization", () => {
  assert.ok(app, "Firebase app should be initialized");
  assert.ok(auth, "Firebase auth should be initialized");
  assert.ok(db, "Firestore db should be initialized");
  assert.ok(storage, "Firebase storage should be initialized");
  assert.equal(ADMIN_EMAIL, "piyushbhagwat5@gmail.com", "Admin email must match the authorized admin email");
});

test("isAuthorizedAdmin validation", () => {
  // Authorized admin scenarios
  assert.equal(isAuthorizedAdmin({ email: "piyushbhagwat5@gmail.com" }), true);
  assert.equal(isAuthorizedAdmin({ email: "PIYUSHBHAGWAT5@GMAIL.COM" }), true);
  assert.equal(isAuthorizedAdmin({ email: "  piyushbhagwat5@gmail.com  " }), true);

  // Unauthorized scenarios
  assert.equal(isAuthorizedAdmin(null), false);
  assert.equal(isAuthorizedAdmin({}), false);
  assert.equal(isAuthorizedAdmin({ email: "" }), false);
  assert.equal(isAuthorizedAdmin({ email: "attacker@gmail.com" }), false);
  assert.equal(isAuthorizedAdmin({ email: "piyushbhagwat5@other.com" }), false);
});

test("formatAuthErrorMessage mappings", () => {
  assert.match(
    formatAuthErrorMessage({ code: "auth/invalid-credential" }),
    /Invalid email or password/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/wrong-password" }),
    /Invalid email or password/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/user-not-found" }),
    /Invalid email or password/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/invalid-email" }),
    /valid email/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/user-disabled" }),
    /disabled/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/too-many-requests" }),
    /Too many failed attempts/i
  );
  assert.match(
    formatAuthErrorMessage({ code: "auth/network-request-failed" }),
    /Network error/i
  );
  assert.equal(
    formatAuthErrorMessage({ code: "auth/unknown-custom-error", message: "Custom failure" }),
    "Custom failure"
  );
  assert.equal(
    formatAuthErrorMessage(null),
    "An unexpected error occurred."
  );
});

test("loginWithEmail client validations and admin restriction", async () => {
  // Missing email
  await assert.rejects(
    async () => {
      await loginWithEmail("", "password123");
    },
    (err) => {
      assert.equal(err.code, "auth/missing-email");
      return true;
    }
  );

  // Missing password
  await assert.rejects(
    async () => {
      await loginWithEmail("piyushbhagwat5@gmail.com", "");
    },
    (err) => {
      assert.equal(err.code, "auth/missing-password");
      return true;
    }
  );

  // Unauthorized email rejected immediately before hitting Firebase
  await assert.rejects(
    async () => {
      await loginWithEmail("unauthorized@example.com", "password123");
    },
    (err) => {
      assert.equal(err.code, "auth/unauthorized-admin");
      assert.match(err.message, /Unauthorized: Access is restricted/i);
      return true;
    }
  );
});

test("logoutAdmin executes successfully", async () => {
  // Signing out when no user is signed in completes cleanly
  await assert.doesNotReject(async () => {
    await logoutAdmin();
  });
});

test("resetAdminPassword restricts non-admin emails", async () => {
  await assert.rejects(
    async () => {
      await resetAdminPassword("hacker@example.com");
    },
    (err) => {
      assert.equal(err.code, "auth/unauthorized-admin");
      return true;
    }
  );
});

test("subscribeToAuthState returns an unsubscribe function", () => {
  const unsubscribe = subscribeToAuthState(() => {});
  assert.equal(typeof unsubscribe, "function", "subscribeToAuthState should return an unsubscribe function");
  unsubscribe();
});

test("Backwards compatibility with src/db/firebase.db.js", () => {
  assert.ok(legacyDb, "Legacy db export should exist and point to firestore");
  assert.ok(legacyStore, "Legacy store export should exist and point to storage");
  assert.equal(typeof getProjects, "function", "Legacy getProjects should remain a callable function");
});
