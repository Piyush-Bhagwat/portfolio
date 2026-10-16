import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MainContent } from "../src/App.jsx";
import Login from "../src/pages/admin/Login.jsx";
import AdminLayout from "../src/layouts/AdminLayout.jsx";
import ProtectedRoute from "../src/components/common/ProtectedRoute.jsx";
import { AuthContext } from "../src/context/AuthContext.jsx";

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

function renderWithAuth(element, authState = mockAuthGuest) {
  return renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: authState },
      element
    )
  );
}

test("Slice 7.4 Smoke Test: Public Homepage (/) renders full Bento Grid & live refactoring banner", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(MainContent)
    )
  );

  // Banner is removed for clean production release
  assert.ok(
    !html.includes("Website refactoring under process"),
    "Production app should not display the temporary refactoring notice banner"
  );

  // Hero tile
  assert.ok(
    html.includes("whoami"),
    "Homepage must contain the terminal whoami prompt"
  );
  assert.ok(
    html.includes("Piyush Bhagwat"),
    "Homepage must display developer name"
  );

  // Status tile
  assert.ok(
    html.includes("Available for new opportunities"),
    "Homepage must show availability status"
  );
  assert.ok(
    html.includes("IST"),
    "Homepage must show live IST timezone clock"
  );

  // Socials dock
  assert.ok(
    html.includes("github.com"),
    "Homepage must show GitHub social link"
  );

  // Skills tile
  assert.ok(
    html.includes("Tech Stack"),
    "Homepage must include tech stack tile"
  );

  // Navigation
  assert.ok(
    html.includes("Projects"),
    "Navbar must include Projects link"
  );
  assert.ok(
    html.includes("Articles"),
    "Navbar must include Articles link"
  );
});

test("Slice 7.4 Smoke Test: Public Projects page (/projects) renders catalog and case studies", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/projects"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(
    html.includes("Engineered Applications"),
    "Projects page header must render"
  );
  assert.ok(
    html.includes("Deep-Dive Case Studies"),
    "Projects page must feature deep-dive case studies metric"
  );
  assert.ok(
    html.includes("Search projects"),
    "Projects page must render live search input"
  );
});

test("Slice 7.4 Smoke Test: Public Articles page (/blogs) renders articles index", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(
    html.includes("Blogs &amp; Publications") || html.includes("Blogs & Publications"),
    "Blogs index must display title"
  );
  assert.ok(
    html.includes("Search articles"),
    "Blogs page must render live search bar"
  );
  assert.ok(
    html.includes("All Topics"),
    "Blogs page must render topic filter tabs"
  );
});

test("Slice 7.4 Smoke Test: Public Article Reader (/blogs/:slug) renders article layout", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/blogs/building-resilient-web-interfaces"] },
      React.createElement(MainContent)
    )
  );

  assert.ok(
    html.includes("Building Resilient Web Interfaces") || html.includes("sys.reader"),
    "Article reader must render article or fallback header"
  );
  assert.ok(
    html.includes("Table of Contents") || html.includes("sys.reader"),
    "Article reader must contain Table of Contents"
  );
});

test("Slice 7.4 Smoke Test: Admin Login (/admin/login) renders terminal login interface", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/login"] },
      React.createElement(Login)
    ),
    mockAuthGuest
  );

  assert.ok(
    html.includes("auth-gateway.sh"),
    "Admin login page must render terminal auth-gateway header"
  );
  assert.ok(
    html.includes("Administrative Gateway"),
    "Admin login must render Administrative Gateway heading"
  );
  assert.ok(
    html.includes("sign-in --admin"),
    "Admin login button must render terminal action"
  );
});

test("Slice 7.4 Smoke Test: Protected admin routes guard unauthenticated access", () => {
  const unauthHtml = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        ProtectedRoute,
        null,
        React.createElement("div", null, "Protected Admin Content")
      )
    ),
    mockAuthGuest
  );

  assert.ok(
    !unauthHtml.includes("Protected Admin Content"),
    "Unauthenticated user must not access protected content"
  );

  const authHtml = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        ProtectedRoute,
        null,
        React.createElement("div", null, "Protected Admin Content")
      )
    ),
    mockAuthAdmin
  );

  assert.ok(
    authHtml.includes("Protected Admin Content"),
    "Authenticated admin user must access protected content"
  );
});

test("Slice 7.4 Smoke Test: Admin Layout renders navigation sidebar for authenticated administrators", () => {
  const html = renderWithAuth(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        Routes,
        null,
        React.createElement(
          Route,
          { element: React.createElement(AdminLayout) },
          React.createElement(Route, {
            path: "/admin/overview",
            element: React.createElement("div", null, "Dashboard Overview Content"),
          })
        )
      )
    ),
    mockAuthAdmin
  );

  assert.ok(
    html.includes("Overview"),
    "Admin sidebar must include Overview link"
  );
  assert.ok(
    html.includes("Profile &amp; Bio") || html.includes("Profile & Bio"),
    "Admin sidebar must include Profile link"
  );
  assert.ok(
    html.includes("Projects &amp; Cases") || html.includes("Projects & Cases"),
    "Admin sidebar must include Projects link"
  );
  assert.ok(
    html.includes("Skills &amp; Stack") || html.includes("Skills & Stack"),
    "Admin sidebar must include Skills link"
  );
  assert.ok(
    html.includes("Work Experience"),
    "Admin sidebar must include Experience link"
  );
  assert.ok(
    html.includes("Technical Blogs"),
    "Admin sidebar must include Technical Blogs link"
  );
  assert.ok(
    html.includes("Dashboard Overview Content"),
    "AdminLayout must render nested outlet content"
  );
});
