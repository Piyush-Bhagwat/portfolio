import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import ProfileCMS, { DEFAULT_PROFILE } from "../src/pages/admin/ProfileCMS.jsx";
import { useFirestoreDoc, saveFirestoreDoc } from "../src/hooks/useFirestore.js";

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

test("DEFAULT_PROFILE schema validation", () => {
  assert.equal(typeof DEFAULT_PROFILE.name, "string", "name must be a string");
  assert.equal(typeof DEFAULT_PROFILE.role, "string", "role must be a string");
  assert.equal(typeof DEFAULT_PROFILE.tagline, "string", "tagline must be a string");
  assert.ok(Array.isArray(DEFAULT_PROFILE.bio_paragraphs), "bio_paragraphs must be an array");
  assert.ok(DEFAULT_PROFILE.bio_paragraphs.length > 0, "bio_paragraphs must not be empty");
  assert.ok(Array.isArray(DEFAULT_PROFILE.socials), "socials must be an array");
  assert.ok(DEFAULT_PROFILE.socials.length > 0, "socials must not be empty");
  assert.ok(DEFAULT_PROFILE.socials[0].platform, "social item must have a platform");
});

test("useFirestore hook exports", () => {
  assert.equal(typeof useFirestoreDoc, "function", "useFirestoreDoc must be exported as a function");
  assert.equal(typeof saveFirestoreDoc, "function", "saveFirestoreDoc must be exported as a function");
});

test("ProfileCMS renders form fields, avatar pipeline, and live bento preview", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/profile"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(ProfileCMS)
      )
    )
  );

  // Header & Title
  assert.ok(html.includes("Profile &amp; Bio CMS") || html.includes("Profile & Bio CMS"), "Should render title");
  assert.ok(html.includes("Save Profile"), "Should render Save Profile button");

  // Form Fields
  assert.ok(html.includes("Full Name"), "Should contain Full Name input");
  assert.ok(html.includes("Professional Role"), "Should contain Role input");
  assert.ok(html.includes("Hero Tagline"), "Should contain Tagline input");
  assert.ok(html.includes("Location"), "Should contain Location input");
  assert.ok(html.includes("Status Badge Text"), "Should contain Status Badge input");
  assert.ok(html.includes("Resume URL"), "Should contain Resume URL input");

  // Cloudinary Avatar Section
  assert.ok(html.includes("Cloudinary Avatar Pipeline"), "Should contain Cloudinary avatar section");
  assert.ok(html.includes("portfolio/avatars"), "Should specify destination folder portfolio/avatars");

  // Bio Paragraphs & Socials
  assert.ok(html.includes("Bio Paragraphs"), "Should contain Bio Paragraphs section");
  assert.ok(html.includes("Add Paragraph"), "Should have Add Paragraph button");
  assert.ok(html.includes("Social Profiles"), "Should contain Social Profiles section");
  assert.ok(html.includes("Add Platform"), "Should have Add Platform button");

  // Live Bento Preview
  assert.ok(html.includes("Live Bento Preview"), "Should contain Live Bento Preview panel");
  assert.ok(html.includes("$ whoami"), "Should render whoami terminal card");
});
