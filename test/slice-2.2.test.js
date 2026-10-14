import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, AuthProvider, useAuth as useAuthDirect } from "../src/context/AuthContext.jsx";
import { useAuth } from "../src/hooks/useAuth.js";
import ProtectedRoute from "../src/components/common/ProtectedRoute.jsx";
import { ProtectedRoute as ProtectedRouteFromIndex } from "../src/components/common/index.js";

test("useAuth hook identity & safety", () => {
  assert.equal(useAuth, useAuthDirect, "src/hooks/useAuth.js must re-export useAuth from AuthContext");

  // Should throw when invoked outside of AuthProvider
  function BadConsumer() {
    useAuth();
    return null;
  }

  assert.throws(
    () => {
      renderToString(React.createElement(BadConsumer));
    },
    /useAuth must be used within an <AuthProvider>/
  );
});

test("AuthProvider provides expected context properties", () => {
  let contextValue = null;

  function ContextConsumer() {
    contextValue = useAuth();
    return React.createElement("div", { id: "test-consumer" }, "Mounted");
  }

  const html = renderToString(
    React.createElement(
      AuthProvider,
      null,
      React.createElement(ContextConsumer)
    )
  );

  assert.ok(html.includes("Mounted"), "AuthProvider should successfully render children");
  assert.ok(contextValue, "Context value should be populated");
  assert.equal(typeof contextValue.login, "function", "context.login should be a function");
  assert.equal(typeof contextValue.logout, "function", "context.logout should be a function");
  assert.equal(typeof contextValue.refreshToken, "function", "context.refreshToken should be a function");
  assert.equal(typeof contextValue.clearError, "function", "context.clearError should be a function");
  assert.equal(contextValue.adminEmail, "piyushbhagwat5@gmail.com", "adminEmail should match authorized email");
});

test("ProtectedRoute exports and index integration", () => {
  assert.equal(
    ProtectedRoute,
    ProtectedRouteFromIndex,
    "ProtectedRoute should be properly exported from src/components/common/index.js"
  );
});

test("ProtectedRoute renders terminal skeleton loader while loading", () => {
  // Mock AuthContext with loading: true
  const mockLoadingAuth = {
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
    adminEmail: "piyushbhagwat5@gmail.com",
    login: async () => {},
    logout: async () => {},
    refreshToken: async () => {},
    clearError: () => {},
  };

  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockLoadingAuth },
        React.createElement(
          ProtectedRoute,
          null,
          React.createElement("div", null, "Secret Admin Panel")
        )
      )
    )
  );

  assert.ok(html.includes("session-guard.sh"), "Should display session-guard.sh terminal title");
  assert.ok(html.includes("verifying session token"), "Should display verifying session text");
  assert.ok(!html.includes("Secret Admin Panel"), "Should NOT render protected content while loading");
});

test("ProtectedRoute redirects unauthenticated users to /admin/login", () => {
  const mockUnauthContext = {
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

  let captured = null;
  function GuardInspector() {
    captured = ProtectedRoute({
      children: React.createElement("div", null, "Secret Admin Panel"),
      redirectTo: "/admin/login",
    });
    return captured;
  }

  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockUnauthContext },
        React.createElement(GuardInspector)
      )
    )
  );

  assert.ok(captured, "ProtectedRoute should return a Navigate component");
  assert.equal(captured.props.to, "/admin/login", "Target must be /admin/login");
  assert.equal(captured.props.replace, true, "Should use replace navigation");
  assert.equal(captured.props.state.from.pathname, "/admin/overview", "Should preserve intended location");
  assert.ok(!html.includes("Secret Admin Panel"), "Protected content should not be revealed");
});

test("ProtectedRoute blocks non-admin authenticated users", () => {
  const mockNonAdminAuth = {
    user: { email: "intruder@gmail.com" },
    isAdmin: false,
    loading: false,
    error: null,
    adminEmail: "piyushbhagwat5@gmail.com",
    login: async () => {},
    logout: async () => {},
    refreshToken: async () => {},
    clearError: () => {},
  };

  let captured = null;
  function GuardInspector() {
    captured = ProtectedRoute({
      children: React.createElement("div", null, "Secret Admin Panel"),
      redirectTo: "/admin/login",
    });
    return captured;
  }

  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockNonAdminAuth },
        React.createElement(GuardInspector)
      )
    )
  );

  assert.ok(captured, "ProtectedRoute should return a Navigate component");
  assert.equal(captured.props.to, "/admin/login", "Target must be /admin/login");
  assert.equal(captured.props.state.unauthorized, true, "Should flag unauthorized access attempt");
  assert.ok(!html.includes("Secret Admin Panel"), "Protected content should not be revealed");
});

test("ProtectedRoute renders protected content for authorized admin", () => {
  const mockAdminAuth = {
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

  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/overview"] },
      React.createElement(
        AuthContext.Provider,
        { value: mockAdminAuth },
        React.createElement(
          ProtectedRoute,
          null,
          React.createElement("div", null, "Secret Admin Panel")
        )
      )
    )
  );

  assert.ok(html.includes("Secret Admin Panel"), "Authorized admin should see the protected admin panel");
});
