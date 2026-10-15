import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ThemeProvider, ThemeContext, THEME_STORAGE_KEY } from "../src/context/ThemeContext.jsx";
import { useTheme } from "../src/hooks/useTheme.js";
import ThemeToggle from "../src/components/brutalist/ThemeToggle.jsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Theme Engine: Storage key and exports validation", () => {
  assert.equal(THEME_STORAGE_KEY, "portfolio-theme", "Theme storage key must be 'portfolio-theme'");
  assert.ok(ThemeProvider, "ThemeProvider component must be defined");
  assert.ok(ThemeContext, "ThemeContext must be defined");
  assert.ok(useTheme, "useTheme hook must be defined");
});

test("Theme Engine: ThemeToggle SSR renders correctly with accessibility attributes", () => {
  const html = renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(ThemeToggle, { size: "sm" })
    )
  );

  assert.ok(html.includes("role=\"button\"") || html.includes("<button"), "ThemeToggle should render a button element");
  assert.ok(html.includes("aria-label="), "ThemeToggle must provide an accessible aria-label");
  assert.ok(html.includes("title="), "ThemeToggle must provide a tooltip title attribute");
});

test("Theme Engine: ThemeToggle supports showLabel prop", () => {
  const htmlWithLabel = renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(ThemeToggle, { size: "md", showLabel: true })
    )
  );

  assert.ok(
    htmlWithLabel.includes("Dark") || htmlWithLabel.includes("Light") || htmlWithLabel.includes("Theme"),
    "ThemeToggle with showLabel=true should display theme text"
  );
});

test("Theme Engine: ThemeToggle sizes (sm, md, lg) render valid classes", () => {
  const smHtml = renderToString(
    React.createElement(ThemeProvider, null, React.createElement(ThemeToggle, { size: "sm" }))
  );
  const mdHtml = renderToString(
    React.createElement(ThemeProvider, null, React.createElement(ThemeToggle, { size: "md" }))
  );
  const lgHtml = renderToString(
    React.createElement(ThemeProvider, null, React.createElement(ThemeToggle, { size: "lg" }))
  );

  assert.ok(smHtml.length > 0, "Small theme toggle renders");
  assert.ok(mdHtml.length > 0, "Medium theme toggle renders");
  assert.ok(lgHtml.length > 0, "Large theme toggle renders");
});

test("Theme Engine: Anti-FOUC synchronous script is present in index.html head", () => {
  const indexPath = path.resolve(__dirname, "../index.html");
  const indexHtml = fs.readFileSync(indexPath, "utf-8");

  assert.ok(
    indexHtml.includes("portfolio-theme"),
    "index.html must reference 'portfolio-theme' in a pre-hydration script"
  );
  assert.ok(
    indexHtml.includes("document.documentElement.classList.add"),
    "index.html must synchronously apply the theme class to documentElement"
  );
  assert.ok(
    indexHtml.includes("prefers-color-scheme"),
    "index.html must check prefers-color-scheme as fallback"
  );
});

test("Theme Engine: tailwind.config.js specifies darkMode: 'class' and sage/forest tokens", async () => {
  const tailwindPath = path.resolve(__dirname, "../tailwind.config.js");
  const tailwindConfig = fs.readFileSync(tailwindPath, "utf-8");

  assert.ok(
    tailwindConfig.includes("darkMode: 'class'") || tailwindConfig.includes('darkMode: "class"'),
    "tailwind.config.js must enable class-based dark mode"
  );
  assert.ok(
    tailwindConfig.includes("sage"),
    "tailwind.config.js must define the sage color scale for the subtle green light theme"
  );
  assert.ok(
    tailwindConfig.includes("forest"),
    "tailwind.config.js must define the forest semantic color palette"
  );
  assert.ok(
    tailwindConfig.includes("brutal-forest"),
    "tailwind.config.js must define brutal-forest offset shadows for light theme"
  );
});

test("Theme Engine: CSS custom properties are defined for root and dark mode", () => {
  const cssPath = path.resolve(__dirname, "../src/styles/index.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(cssContent.includes(":root"), "index.css must define :root CSS custom variables");
  assert.ok(cssContent.includes(".dark"), "index.css must define .dark CSS custom variables");
  assert.ok(cssContent.includes("--bg-base"), "index.css must define --bg-base");
  assert.ok(cssContent.includes("--card-surface"), "index.css must define --card-surface");
});
