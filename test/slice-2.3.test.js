import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import Login from "../src/pages/admin/Login.jsx";
import AdminLayout from "../src/layouts/AdminLayout.jsx";
import Overview from "../src/pages/admin/Overview.jsx";
import ModulePlaceholder from "../src/pages/admin/ModulePlaceholder.jsx";

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

const mockAuthGuest = {
  user: null,
  isAdmin: false,
  loading: false,
  error: null,
  adminEmail: "piyushbhagwat5@gmail.com",
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
  clearError: () => {},
};

test("Login page renders neo-brutalist terminal authentication gateway", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/login"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthGuest },
        React.createElement(Login)
      )
    )
  );

  assert.ok(html.includes("auth-gateway.sh"), "Should display auth-gateway.sh terminal title");
  assert.ok(html.includes("Administrative Gateway"), "Should render Administrative Gateway heading");
  assert.ok(html.includes("Admin Email"), "Should contain Admin Email field label");
  assert.ok(html.includes("Password"), "Should contain Password field label");
  assert.ok(html.includes("sign-in --admin"), "Should contain terminal sign-in button");
  assert.ok(html.includes("piyushbhagwat5@gmail.com"), "Should display whitelisted admin email");
});

test("Login page displays unauthorized access banner when redirected", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      {
        initialEntries: [
          {
            pathname: "/admin/login",
            state: { unauthorized: true },
          },
        ],
      },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthGuest },
        React.createElement(Login)
      )
    )
  );

  assert.ok(html.includes("Access Denied"), "Should display Access Denied banner");
  assert.ok(html.includes("[AUTH_ERROR]"), "Should show [AUTH_ERROR] label");
});

test("AdminLayout renders top bar, responsive sidebar, and nav modules", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthAdmin },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(AdminLayout) },
            React.createElement(
              Route,
              {
                path: "/admin/overview",
                element: React.createElement("div", null, "Child Outlet Content"),
              }
            )
          )
        )
      )
    )
  );

  // Top Bar elements
  assert.ok(html.includes("ADMIN_CMS"), "Should display top brand label");
  assert.ok(html.includes("ADMIN ACTIVE"), "Should render ADMIN ACTIVE status pill");
  assert.ok(html.includes("Public Site"), "Should render quick link to public portfolio");

  // Sidebar elements
  assert.ok(html.includes("Overview"), "Sidebar should include Overview link");
  assert.ok(html.includes("Profile &amp; Bio") || html.includes("Profile & Bio"), "Sidebar should include Profile & Bio link");
  assert.ok(html.includes("Projects &amp; Cases") || html.includes("Projects & Cases"), "Sidebar should include Projects link");
  assert.ok(html.includes("Skills &amp; Stack") || html.includes("Skills & Stack"), "Sidebar should include Skills link");
  assert.ok(html.includes("Technical Blogs"), "Sidebar should include Blogs link");
  assert.ok(html.includes("Sign Out"), "Sidebar should include Sign Out button");

  // Outlet element
  assert.ok(html.includes("Child Outlet Content"), "Should render child outlet content within layout");
});

test("Overview page renders control center and bento cards", () => {
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

  assert.ok(html.includes("Control Center"), "Should render Control Center title");
  assert.ok(html.includes("sys.status --admin --verbose"), "Should render terminal command");
  assert.ok(html.includes("Profile &amp; Bio") || html.includes("Profile & Bio"), "Should render Profile BentoCard");
  assert.ok(html.includes("Projects &amp; Cases") || html.includes("Projects & Cases"), "Should render Projects BentoCard");
  assert.ok(html.includes("Technical Articles"), "Should render Articles BentoCard");
  assert.ok(
    html.includes("system-metadata.log"),
    "Should render metadata window"
  );
  assert.ok(!html.includes("SPRINT STATUS"), "Sprint status should not be present in production dashboard");
});

test("ModulePlaceholder renders scheduled sprint roadmap info", () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ModulePlaceholder, {
        title: "Profile & Bio CMS",
        day: "Day 3",
        description: "Manage personal bio and avatar.",
      })
    )
  );

  assert.ok(html.includes("Profile &amp; Bio CMS") || html.includes("Profile & Bio CMS"), "Should render module title");
  assert.ok(html.includes("Scheduled:") && html.includes("Day 3"), "Should display scheduled day badge");
  assert.ok(html.includes("Back to Overview"), "Should have return button");
});
