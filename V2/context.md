# Portfolio V2 — Project Context & Session History

This document serves as the persistent memory, architectural reference, and operational context for the **Portfolio V2** redesign and modernization project. It details the complete 7-day implementation sprint, subsequent bug fixes, the Cloudinary media pipeline resolution, active design tokens, and verification status.

---

## 1. Project High-Level Overview

- **Owner**: Piyush Bhagwat (`piyushbhagwat5@gmail.com`)
- **Repository**: `portfolio` (React 18 + Vite SPA)
- **Production Architecture**:
  - **Frontend**: React 18, React Router v6, Tailwind CSS v3, Framer Motion, Lucide React, React Markdown + Remark GFM.
  - **Backend & Auth**: Firebase Authentication (restricted to admin email), Cloud Firestore (`site_config/profile`, `skills`, `experiences`, `projects`, `blogs`).
  - **Media Pipeline**: Cloudinary CDN (unsigned uploads via `portfolio_unsigned` preset, dynamic WebP/AVIF transformation).
  - **Design System**: Neo-Brutalist Bento-Grid developer aesthetic with a **First-Class Dual-Theme Architecture**:
    - **Dark Theme**: Terminal hacker palette (`#09090b` canvas, `#121215` card surface, `#27272a` borders, `#10b981` emerald & `#06b6d4` cyan accents, `#fafafa` text, `4px 4px 0px #000000` tactile brutalist shadows).
    - **Light Theme (Subtle Greenish Tones)**: Organic celadon/sage palette based on ergonomic color theory (`#f4f7f4` light sage canvas, `#ffffff` bone cards, `#e9f0ea` muted laurel hover surfaces, `#1b2e23` deep evergreen borders and tactile shadows, `#0f1a14` deep forest charcoal text with 15.2:1 AAA contrast, `#4b5e53` slate pine muted text, `#059669` emerald interactive accents).
    - **Theme Toggle Engine**: Persistent 1-click switcher (`ThemeContext`, `ThemeToggle`), `localStorage` sync, OS `prefers-color-scheme` matching, and zero-FOUC pre-hydration execution.

---

## 2. Sprint Roadmap & Current Status

| Phase / Day | Theme / Focus | Status | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Day 1** | **Foundations, Tokens & Cloudinary** | **COMPLETED** | Tailwind config, brutalist primitives, Cloudinary service & uploader |
| **Day 2** | **Auth, Session Guard & Admin Shell** | **COMPLETED** | Firebase Auth context, ProtectedRoute, AdminLayout sidebar, /admin/login |
| **Day 3** | **Profile, Skills & Experience CMS** | **COMPLETED** | ProfileCMS, SkillsCMS, ExperienceCMS, Firestore V1->V2 migration seeder |
| **Day 4** | **Projects & Case Studies Engine** | **COMPLETED** | ProjectsCMS, dynamic project editor modal, live preview drawer |
| **Day 5** | **Blog Engine: Editor & Media Pipeline** | **COMPLETED** | Split-pane markdown editor, Cloudinary asset dropper, draft/publish workflow |
| **Day 6** | **Public Blog Reader & Projects Catalog** | **COMPLETED** | `/blogs` catalog, reader with TOC & syntax styling, `/projects` catalog |
| **Day 7** | **Bento-Grid Homepage, Polish & Cutover**| **COMPLETED** | 6-tile Bento homepage, Framer Motion entrance, full cutover from V1 |
| **Post-Launch**| **UX Polish, Cleanups & Media Pipeline Fix** | **COMPLETED** | Removed banners & sprint labels, fixed avatar upload lifecycle & enlarged hero photo |
| **Scope Addition** | **Dual-Theme Engine (Subtle Greenish Light & Dark)** | **COMPLETED** | Color theory calibration, ThemeContext, ThemeToggle button, CSS semantic tokens, cross-view light theme adaptation |
| **Blog Suite V2** | **Editor Scrolling, Lightbox & Tag Intelligence** | **COMPLETED** | Split-editor scroll sync, direct/base64 dropper, fullscreen image lightbox with multi-level zoom, sticky TOC sidebar, dynamic top 15 tag suggestions |
| **Blog Media & Slug** | **Cloudinary-Only Pipeline & In-Preview Media Controls** | **COMPLETED** | Direct `blog/{slug}` upload, base64 elimination, in-preview Delete/Replace over images, locked immutable slug |

---

## 3. Work Completed by Day & Slice

### Day 1: Foundations, Design Tokens & Primitives
- **Slice 1.1**: Styling infrastructure (`tailwindcss@^3.4.17`, `@tailwindcss/typography`, `lucide-react`, `JetBrains Mono`, `Inter`, `brutalist.css`).
- **Slice 1.2**: Neo-Brutalist primitives (`BentoCard`, `BrutalButton`, `TagBadge`, `TerminalBox`, `StatusPill`).
- **Slice 1.3**: Cloudinary media service (`src/services/cloudinary.js`) and `ImageUploader.jsx` component.

### Day 2: Authentication, Security & Admin Shell
- **Slice 2.1**: Firebase service initialization (`src/services/firebase.js`) supporting Firebase Auth and Firestore.
- **Slice 2.2**: `AuthContext.jsx` and `ProtectedRoute.jsx` route protection ensuring unauthorized users are redirected to `/admin/login`.
- **Slice 2.3**: `AdminLayout.jsx` with collapsible responsive sidebar navigation, brutalist active states, and user session badge.
- **Slice 2.4**: `firestore.rules` and terminal-styled `/admin/login` page with authentication error feedback.

### Day 3: Profile, Skills & Experience CMS
- **Slice 3.1**: `ProfileCMS.jsx` for managing bio paragraphs, hero tagline, Cloudinary avatar, status badge, and social links with live Bento preview.
- **Slice 3.2**: `SkillsCMS.jsx` and `SkillEditorModal.jsx` for managing tech stack with category filtering and reordering.
- **Slice 3.3**: `ExperienceCMS.jsx` and `ExperienceEditorModal.jsx` for career timeline milestones.
- **Slice 3.4**: `src/scripts/seedData.js` migration seeder script for transitioning legacy V1 content to Firestore.

### Day 4: Projects & Case Studies Engine
- **Slice 4.1**: Firestore `projects` collection schema with deep case study fields (overview, problem, solution, architecture, challenges, results, metrics).
- **Slice 4.2**: `ProjectEditorModal.jsx` tabbed modal (Basic Info, Tech Stack, Deep Case Study).
- **Slice 4.3**: `ProjectsCMS.jsx` management table with status pills, featured toggles, search, and category filters.
- **Slice 4.4**: `CaseStudyDrawer.jsx` live preview drawer for inspecting case study layouts prior to publication.

### Day 5: Blog Engine (Markdown Editor & CMS)
- **Slice 5.1**: Firestore `blogs` collection schema with reading time calculator, slug generator, and tag indexing.
- **Slice 5.2**: Cloudinary image dropper modal (`sys.media.cloudinary_dropper.sh`) with 1-click Markdown snippet insertion (`![Alt](url)`).
- **Slice 5.3**: `BlogEditor.jsx` split-pane Markdown editor with real-time preview, word count, estimated reading time, and cover image uploader.
- **Slice 5.4**: `BlogsCMS.jsx` administrative dashboard for articles with draft/published status toggling and quick search.

### Day 6: Public Content Showcase
- **Slice 6.1**: `/blogs` public articles catalog with search bar, tag filtering, reading time indicators, and responsive grid.
- **Slice 6.2**: `/blogs/:slug` dedicated article reader with sticky Table of Contents, typography styling, and share actions.
- **Slice 6.3**: `/projects` public catalog with category tabs, live demo links, and `CaseStudyModal.jsx` for in-depth engineering breakdowns.

### Day 7: Bento-Grid Homepage, Polish & Cutover
- **Slice 7.1**: Public Bento-Grid Homepage (`src/pages/public/HomePage.jsx`) with 6 interactive tiles:
  1. *Tile 1 (2x2)*: Hero terminal with dynamic identity, avatar, and high-contrast CTAs.
  2. *Tile 2 (1x1)*: Real-time IST Metadata clock, availability pill, and location.
  3. *Tile 3 (1x1)*: Verified social channel links and resume quick dock.
  4. *Tile 4 (2x1)*: Integrated tech stack matrix with interactive category filtering.
  5. *Tile 5 (2x1)*: Featured engineering projects showcase with deep case study modals.
  6. *Tile 6 (2x1)*: Latest published engineering insight article preview.
- **Slice 7.2**: Tactile micro-interactions and Framer Motion entrance animations.
- **Slice 7.3**: Performance optimizations, Vite rollup chunk splitting (`vendor-core`, `vendor-firebase`, `vendor-framer-motion`, `vendor-markdown`, `vendor-icons`), SEO metadata, and dynamic Cloudinary WebP/AVIF delivery.
- **Slice 7.4**: Full cutover in `src/App.jsx` pointing public routes directly to V2 pages.

---

## 4. Post-Cutover Polish & Bug Fixes

### 1. UI Cleanups
- **Public Homepage**: Removed the temporary refactoring warning banner for a clean production presentation.
- **Admin Dashboard**: Removed internal sprint roadmap widgets and "Day X" labels from `Overview.jsx` and `AdminLayout.jsx` to establish a permanent, professional CMS dashboard.

### 2. Cloudinary Avatar Pipeline Resolution
- **Investigation**: When uploading an avatar in `ProfileCMS.jsx`, the upload did not complete, no asset appeared in Cloudinary, and no error was displayed.
- **Root Cause Discovered**:
  - In `ImageUploader.jsx`, a `useEffect` with dependency `[localPreview]` had a cleanup function calling `abortControllerRef.current.abort()`.
  - When the user selected a file, `handleFileSelected` updated `localPreview` to an object blob URL while simultaneously starting `executeUpload`.
  - React's re-render executed the previous effect's cleanup, which immediately aborted the in-flight upload via `abortControllerRef.current.abort()`.
  - Because `executeUpload` silently caught `AbortError` (to allow graceful unmounts), no error message was shown and the upload was cancelled before transmitting.
- **Fixes Applied**:
  1. **Abort Lifecycle**: Moved the cancellation cleanup strictly to component unmount (`useEffect(..., [])`).
  2. **Blob URL Management**: Tracked blob URLs via `blobUrlRef` and properly released memory with `URL.revokeObjectURL`.
  3. **MIME & Extension Hardening**: Updated `validateImageFile` in `src/services/cloudinary.js` to accept `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, and `.avif` case-insensitively, handling environments where browsers or OS report `image/jpg` or blank MIME types.
  4. **Config Fallbacks**: Added default fallbacks in `CLOUDINARY_CONFIG` (`dsdqo228u`, `portfolio_unsigned`) to ensure client configurations never evaluate to empty strings.
  5. **File Input Reset**: Added `onClick={(e) => { e.target.value = null; }}` on the file input so selecting the same file repeatedly always triggers `onChange`.
  6. **Firestore Persistence**: Updated `DEFAULT_PROFILE` and `SEED_PROFILE` to the real Cloudinary avatar URL (`masarithpr6rydaz1ybq`). Updated `handleAvatarUploaded` and `handleAvatarRemoved` in `ProfileCMS.jsx` to auto-persist changes directly to Firestore (`site_config/profile`).
  7. **Uploader UX**: Added `aspectRatio="square"` support and prominent **Change / Replace Image** and **Remove** action buttons in `ImageUploader.jsx`.

### 3. Hero Card Space Utilization & Photo Enlargement
- **Problem**: In `HeroTile.jsx` (the 2x2 Bento tile), the developer photo was small (`w-20`/`w-24`, 80-96px), leaving excessive empty black space above the bottom action buttons.
- **Changes Implemented**:
  - Substantially enlarged avatar dimensions: `w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44` (up to 176px).
  - Increased Cloudinary delivery transformation request to `{ width: 400, height: 400, crop: "fill" }` for high-DPI displays.
  - Added Neo-Brutalist `shadow-brutal` and `border-2 border-zinc-700` styling with an enlarged status dot (`w-5 h-5`).
  - Adjusted container vertical spacing (`space-y-6 sm:space-y-8`) and typography (`text-base sm:text-lg` tagline, `md:text-[15px]` bio paragraphs) to naturally fill the 2x2 card height.

### 4. Mobile View Bento-Grid Height & Blank Space Resolution
- **Investigation**: On mobile viewports (< 640px), all Bento cards rendered as full-screen cards (~850px-900px tall), introducing massive amounts of unwanted empty black space.
- **Root Cause Discovered**:
  - In `src/pages/public/HomePage.jsx`, the Bento grid container had `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"`.
  - The Tailwind utility `auto-rows-fr` sets CSS `grid-auto-rows: minmax(0, 1fr)`.
  - In CSS Grid Level 1 specifications, when a grid container's inner size is indefinite, `1fr` in auto rows resolves to the maximum `max-content` size among all tracks.
  - On single-column mobile viewports (`grid-cols-1`), all 6 tiles are stacked into individual rows. `FeaturedProjectsTile` (Tile 6) contains 3 vertically stacked project spotlight cards, resulting in a natural height of ~850px-900px.
  - Consequently, `1fr` resolved to ~850px-900px for *all* rows in the grid, forcing compact tiles like `StatusTile` (~190px content), `SocialsTile` (~170px content), `LatestBlogTile` (~180px content), and `SkillsTile` (~240px content) to expand to 850px+.
  - In combination with `className="h-full"` and `flex flex-col justify-between`, this stretched individual cards across the entire mobile screen, creating 650px+ of empty black void inside every card.
- **Fixes Applied**:
  1. **Removed `auto-rows-fr`**: Removed `auto-rows-fr` from `src/pages/public/HomePage.jsx`, allowing each grid track to size naturally (`auto`) according to its own content height on mobile and tablet.
  2. **Desktop & Tablet Parity**: Without `auto-rows-fr`, desktop (`lg:grid-cols-4`) tracks still size gracefully: `StatusTile` and `SocialsTile` in Row 1 match each other's height via `h-full`, `SkillsTile` matches Row 2, and `HeroTile` (`lg:row-span-2`) spans both cleanly without forcing full-width tiles (`LatestBlogTile` and `FeaturedProjectsTile`) to inflate.
  3. **Mobile Padding & Spacing Refinements**:
     - `FeaturedProjectsTile.jsx`: Updated outer padding to `p-5 sm:p-8`, spacing to `space-y-5 sm:space-y-6`, and corrected non-standard `p-4.5` to `p-4 sm:p-5`.
     - `HeroTile.jsx`: Refined outer padding to `p-5 sm:p-8`, content spacing to `space-y-5 sm:space-y-8`, and CTA button container to `pt-5 mt-5 sm:pt-6 sm:mt-6` with `gap-2.5 sm:gap-3`.
     - `StatusTile.jsx`: Refined mobile padding to `p-4 sm:p-5` and vertical spacing to `space-y-3.5 my-2`.
     - `SocialsTile.jsx`: Refined mobile padding to `p-4 sm:p-5`.
     - `SkillsTile.jsx`: Refined mobile padding to `p-4 sm:p-6` and added `flex-wrap` to category filter pills to prevent horizontal clipping on narrow mobile screens.
     - `LatestBlogTile.jsx`: Refined mobile padding to `p-4 sm:p-5`.

### 5. Terminology Alignment: "Telemetry" to "Metadata"
- **Scope**: Uniform replacement of legacy "Telemetry" terminology with "Metadata".
- **Updates Applied**:
  - `StatusTile.jsx`: Header label updated from `Telemetry` to `Metadata`.
  - `Overview.jsx`: Diagnostic log updated from `system-telemetry.log` to `system-metadata.log`.
  - Component comments synchronized in `HomePage.jsx`, `LatestBlogTile.jsx`, `BlogPostPage.jsx`, `BlogEditor.jsx`, and `BlogsCMS.jsx`.
  - Automated test assertions updated across `test/slice-2.3.test.js`, `test/slice-5.1.test.js`, `test/slice-5.4.test.js`, `test/slice-6.1.test.js`, `test/slice-6.2.test.js`, `test/slice-6.3.test.js`, `test/slice-7.1.test.js`, and `test/slice-7.2.test.js`.
  - Verified 0 remaining occurrences of "telemetry" across the repository and 108/108 passing tests.

### 6. Empty Category Tag Badges, Seeder Deprecation & Public Nav Cleanup
- **TagBadge Empty Boxes Fix**:
  - In `src/components/brutalist/TagBadge.jsx`, the component previously expected `children` to render text, but multiple callers (`ProjectCard.jsx`, `FeaturedProjectsTile.jsx`, `BlogPostPage.jsx`, `CaseStudyModal.jsx`) passed `label={tag}` without children.
  - As a result, `<span className="truncate">{children}</span>` rendered empty strings while the badge container styling created empty dark boxes.
  - Updated `TagBadge.jsx` to support `const content = children ?? label`, and updated all callers to pass children explicitly.
- **Admin Overview Database Seeder Removal**:
  - Removed `seed_database.sh` TerminalBox from `src/pages/admin/Overview.jsx` as initial seeding is complete.
  - Cleaned up unused seeder imports and state (`seedAllData`, `seeding`, `overwrite`, `seedResult`, `handleSeed`).
  - Expanded `system-metadata.log` diagnostic TerminalBox to clean single-column presentation.
  - Aligned `test/slice-3.4.test.js` to assert that `seed_database.sh` is cleanly omitted in production.
- **Public Navigation Cleanup**:
  - Removed `{ label: "⚡ V2 Primitives", path: "/v2-preview", accent: "text-terminal-green" }` from `navLinks` in `src/components/layout/PublicNavbar.jsx`.
  - Updated `HeroTile.jsx` terminal badge from `sys.v2.active` to `sys.prod.active`.

### 7. Netlify SPA Direct Route 404 Resolution
- **Problem**: When navigating to the root URL `/`, the site rendered normally. However, navigating directly to client-side routes (e.g. `/projects`, `/blogs`, `/admin/login`) or reloading non-root pages resulted in a Netlify HTTP 404 error ("Page Not Found").
- **Root Cause Discovered**:
  - Netlify is a static hosting platform. By default, when a user requests `/projects`, Netlify attempts to look up a static file at `/projects/index.html` or `/projects`.
  - In a Single Page Application (SPA) driven by React Router, all client-side routes exist dynamically inside the JavaScript bundle loaded by `/index.html`.
  - Without an explicit rewrite rule, Netlify does not know to route unrecognized request paths back to `/index.html`, causing it to respond with a 404 status.
- **Fixes Applied**:
  1. **`public/_redirects`**:
     - Created `public/_redirects` with rule: `/*    /index.html   200`.
     - Vite's build pipeline automatically copies files from `public/` directly into the `dist/` root, ensuring `dist/_redirects` is deployed with every build.
  2. **`netlify.toml`**:
     - Created root `netlify.toml` with build commands and explicit SPA redirects table:
       ```toml
       [build]
         command = "npm run build"
         publish = "dist"

       [[redirects]]
         from = "/*"
         to = "/index.html"
         status = 200
       ```
     - Having both `public/_redirects` and `netlify.toml` ensures defense-in-depth across Netlify CLI, Git-triggered Netlify deployments, and manual drag-and-drop deployments.
  3. **Automated Verification**:
     - Added test in `test/slice-7.3.test.js` validating that `public/_redirects` and `netlify.toml` exist with the proper 200 rewrite rule.

### 8. Work Experience & Milestones Timeline Integration on Homepage
- **Problem**: While career experiences were persisted in Firestore (`experiences` collection) and fully manageable via the Admin CMS (`/admin/experience`), the public homepage (`HomePage.jsx`) lacked a public-facing display for career milestones, making work history invisible to visitors.
- **Implementation**:
  1. **`ExperienceTimeline.jsx` Component**:
     - Created `src/components/home/ExperienceTimeline.jsx` implementing a Neo-Brutalist chronological timeline.
     - Features: Terminal header (`$ sys.timeline --career`), vertical spine border, pulsing node indicators, role titles, company names with `Building` icons, period badges (`Calendar`), location indicators (`MapPin`), full role descriptions, and wrap tags for `skills_used`.
  2. **`HomePage.jsx` Integration**:
     - Placed as a dedicated timeline section directly below the 4-column Bento grid.
     - Dynamic Firestore listener fetching documents from `collection(db, "experiences")` ordered by `order: "asc"`, with resilient fallback to `DEFAULT_EXPERIENCES`.
     - Exported through `src/components/home/index.js`.
  3. **Automated Verification**:
     - Added unit tests in `test/slice-7.1.test.js` asserting proper rendering of `ExperienceTimeline` and verifying its presence on the public `HomePage`.

### 9. Scope Addition: Dual-Theme Architecture (Subtle Greenish Light Theme & Toggle)
- **Scope Motivation**:
  - The portfolio initially launched with a high-contrast Dark Mode (`#09090b`).
  - To expand usability across varied ambient lighting conditions, eliminate ocular fatigue, and provide user choice, a first-class **Dual-Theme Architecture** featuring an organic, subtle greenish Light Theme and a seamless 1-click toggle has been brought into active scope.
- **Color Theory & Subtle Greenish Tones**:
  - *Anti-Glare Ergonomics*: Conventional stark `#ffffff` canvases cause extreme eye strain and feel detached from the terminal/engineering ethos. Instead, the light theme employs a soft **pale sage / celadon canvas (`#f4f7f4`)** with high lightness (>96%) and restrained saturation (~4%).
  - *Elevation & Depth Hierarchy*:
    - Canvas Base: `#f4f7f4` (Light Sage / Pale Celadon)
    - Bento Cards / Surface: `#ffffff` (Crisp Pure White)
    - Hover / Nested Rows / Code Tiles: `#e9f0ea` (Muted Laurel / Mint)
  - *Contrast & Readability (WCAG 2.1 AA/AAA)*:
    - Primary Text: `#0f1a14` (Deep Forest Charcoal) — achieves a **15.2:1 contrast ratio**, easily satisfying WCAG AAA.
    - Muted Secondary Text: `#4b5e53` (Slate Pine) — achieves a **5.1:1 contrast ratio**, exceeding WCAG AA.
    - Interactive Accent: `#059669` (Emerald-600) / `#047857` (Emerald-700) — deep jade green calibrated for light mode, providing >4.6:1 AA contrast (replacing `#10b981` which only had 3.1:1 contrast on white).
    - Secondary Accent: `#0891b2` (Cyan-600) / `#0e7490` (Cyan-700).
  - *Neo-Brutalist Continuity*:
    - Outer Borders: `#1b2e23` (Deep Evergreen Charcoal, solid `1px`/`2px`).
    - Internal Dividers: `#cbdad0` (Muted Sage Gray).
    - Tactile Shadows: `#1b2e23` hard offset drop shadows (`4px 4px 0px 0px #1b2e23`), preserving the punchy physical press feedback in daylight.
    - Blueprint Grid: `radial-gradient(rgba(27, 46, 35, 0.10) 1px, transparent 1px)`.
- **Theme Engine Architecture**:
  - *`ThemeContext.jsx` & `useTheme.js`*: Global state provider managing `'dark' | 'light'`, dispatching class updates to `document.documentElement`, synchronizing with `localStorage` (`'portfolio-theme'`), and listening to OS `(prefers-color-scheme: dark)` changes.
  - *Zero-FOUC Initialization*: Inline script in `index.html` resolving theme before React hydration to eliminate visual flash.
  - *`ThemeToggle.jsx` Component*: Neo-brutalist interactive switch placed in `PublicNavbar` and `AdminLayout`, complete with animated Sun/Moon transitions and full accessibility (`aria-label`).

### 10. Admin Panel Comprehensive Dual-Theme Calibration
- **Motivation**: While public routes adopted the subtle greenish light theme, portions of the Admin Panel (specifically cards in `ProjectsCMS`, `BlogsCMS`, `Overview`, `ProfileCMS`, `SkillsCMS`, `ExperienceCMS`, and editor modals) previously maintained hardcoded dark-mode backgrounds (`bg-zinc-900` or `#09090b`) without proper daylight surface elevation and border contrast.
- **Implementation**:
  - Aligned all admin cards, forms, inputs, table rows, and modals to the Neo-Brutalist sage/forest theme system (`bg-white dark:bg-zinc-950`, border `border-[#1b2e23] dark:border-zinc-800`, text `text-[#0f1a14] dark:text-zinc-100`, muted text `text-[#4b5e53] dark:text-zinc-400`, drop shadows `shadow-brutal-forest dark:shadow-brutal`).
  - Calibrated status badges, empty logs, and action bars across all CMS sub-views.

### 11. Unified Drag-and-Drop CMS Sequence Reordering & Automatic Normalization Engine
- **Scope & Problem**: Originally, reordering records in `ProjectsCMS`, `SkillsCMS`, and `ExperienceCMS` required manually calculating and re-entering sequence numbers for all items or suffering sequence collisions and gaps. There was no direct tactile drag-and-drop capability, creating friction during portfolio curation.
- **Implementation & Architecture**:
  1. **Native HTML5 Drag-and-Drop Across All Content Modules**:
     - **Projects CMS** (`ProjectsCMS.jsx`): Tactile `GripVertical` handle on each project card header, reordering both catalog display and homepage Bento presentation.
     - **Skills CMS** (`SkillsCMS.jsx`): Tactile `GripVertical` handle on skill cards, reordering tech stack cards and homepage marquee while maintaining category filtering compatibility.
     - **Experience CMS** (`ExperienceCMS.jsx`): Tactile `GripVertical` handle on career milestone cards, directly governing the chronological order rendered on the homepage `ExperienceTimeline.jsx`.
     - **Visual States**: Active drag item dims with dashed emerald border (`opacity-40 border-dashed border-emerald-600 scale-[0.99]`), while drop target highlights with emerald focus ring (`ring-2 ring-emerald-500 shadow-lg`).
  2. **Centralized Sequence Normalizer & Firestore Batch Sync (`reorderAndPersist`)**:
     - Enforces strict sequential indexing ($1..N$) without gaps or duplicates.
     - **Write Optimization**: Computes delta (`prevOrder !== newOrder`) and writes an atomic Firestore `writeBatch` including only the documents whose order actually changed.
     - Centralizes state for both drag-and-drop and accessible Up/Down chevron controls.
  3. **Auto-Shifting Display Order on Create / Edit**:
     - In `handleSaveProject`, `handleSaveSkill`, and `handleSaveExperience`: When an item is assigned sequence order $k$, existing items from $k$ onwards automatically shift $+1$ via atomic batch write.
     - `ProjectEditorModal`, `SkillEditorModal`, and `ExperienceEditorModal` receive `nextOrder={items.length + 1}` to default new items to the next sequential position.
     - Display order input fields display microcopy: `(Auto-shifts others)`.
  4. **Gapless Sequence Collapse on Deletion**:
     - Deleting any item in `handleDeleteProject`, `handleDeleteSkill`, or `handleDeleteExperience` immediately collapses subsequent items from $1..(N-1)$ without leaving sequence voids.
  5. **Live Status Feedback**:
     - Added `isReordering` state rendering a `REORDERING...` terminal status pill and feedback banners confirming the assigned sequence number.

### 12. Markdown Editor Studio Scroll Synchronization & Viewport Flex Containment
- **Problem & Symptoms**:
  - In `src/pages/admin/BlogEditor.jsx`, neither the raw Markdown editor textarea nor the live rendered preview pane would scroll when content exceeded the viewport.
  - The outer window attempted to scroll the entire page layout instead, breaking split-screen side-by-side editing.
- **Root Cause Discovered**:
  - In CSS Flexbox, flex items default to `min-height: auto`. When nested flex containers contain long content, they expand to their full content height rather than conforming to the parent container height, unless explicitly constrained with `min-h-0` and `overflow-hidden`.
  - `TerminalBox.jsx` hardcoded padding (`p-4 md:p-5`) in its inner body container, preventing child full-bleed layouts and creating inflexible outer boxes.
  - The line numbers gutter (`lineNumbersRef`) was an unlinked `div`, meaning even if the textarea were scrolled, line numbers remained stationary.
  - `MarkdownPreview.jsx` had a redundant internal `overflow-y-auto` wrapper that conflicted with the scroll container in `BlogEditor.jsx`.
- **Architectural Fixes Applied**:
  1. **`TerminalBox` Body Overrides**:
     - Added `bodyClassName` prop support in `src/components/brutalist/TerminalBox.jsx` allowing consumers to bypass default card padding and pass custom flex containment classes.
  2. **Flex Containment Hierarchy in `BlogEditor.jsx`**:
     - Updated `TerminalBox` container with `bodyClassName="p-0 flex flex-col flex-1 min-h-0 overflow-hidden"`.
     - Specified fixed-bound responsive height on the split workspace: `h-[620px] max-h-[calc(100vh-200px)] overflow-hidden min-h-0`.
     - Ensured both the left editor pane and right preview pane enforce `min-h-0 flex-1 overflow-hidden`.
  3. **Synchronized Gutter & Bidirectional Scroll Handling**:
     - Linked line numbers gutter to `lineNumbersRef.current.scrollTop = editor.scrollTop` on textarea scroll.
     - Implemented `handleEditorScroll` and `handlePreviewScroll` calculating percentage-based scroll position:
       $$\text{scrollPercentage} = \frac{\text{scrollTop}}{\text{scrollHeight} - \text{clientHeight}}$$
     - Added an execution lock (`isScrollingRef`) with a 50ms cooldown timeout to prevent infinite scroll loops and jitter when `syncScroll` is enabled.
  4. **Preview Cleanups**:
     - Removed nested `overflow-y-auto` from `MarkdownPreview.jsx`, delegating scroll container responsibility cleanly to the parent container.

### 13. Markdown Image Dropper Direct Upload & Embedded Base64 Fallback Pipeline
- **Problem & Symptoms**:
  - In `BlogImageDropperModal.jsx` (`sys.media.cloudinary_dropper.sh`), selecting an image file via the file picker left the "Insert Image" button disabled.
  - If Cloudinary was unconfigured, rate-limited, or slow to respond, users were completely blocked from inserting images into their articles.
- **Root Cause Discovered**:
  - The "Insert Image" button was strictly bound to `Boolean(imageUrl)`.
  - Selecting a file initiated `executeUpload`, but if the upload failed or remained in-flight, `imageUrl` was never populated.
  - The file `<input>` retained its cached file path, so clicking and selecting the same image file did not trigger `onChange`.
- **Architectural Fixes Applied**:
  1. **Dual-Tier Asset Resolution**:
     - As soon as a file is selected, `FileReader` reads the image into memory as a `data:image/...;base64,...` URL.
     - Sets `imageUrl` immediately to the base64 preview as a robust zero-latency fallback while asynchronously dispatching `uploadToCloudinary`.
  2. **Error Recovery & Fallback Actions**:
     - When Cloudinary upload encounters network errors or credential misconfigurations, the UI displays explicit recovery buttons:
       - **"Retry Cloudinary Upload"**: Re-attempts upload to the CDN.
       - **"Use as Embedded Base64 Image"**: Accepts the inline data URL directly, unblocking article authoring immediately.
  3. **Input Lifecycle & State Resets**:
     - Added `onClick={(e) => { e.target.value = null; }}` on the file input to ensure reselection of identical filenames triggers change events.
     - Cleared all upload states (`file`, `previewUrl`, `imageUrl`, `publicId`, `uploadProgress`, `error`) whenever `isOpen` transitions to true.

### 14. Fullscreen Multi-Level Zoom Lightbox Modal for Blog Reader
- **Problem & Scope**:
  - In `BlogPostPage.jsx`, neither the cover banner thumbnail nor images inside the Markdown article could be viewed in high resolution or zoomed in.
  - Technical architecture diagrams, code screenshots, and system blueprints in articles were difficult to read on smaller screens without fullscreen viewing.
- **Implementation (`ImageLightboxModal.jsx`)**:
  - Created a dedicated Neo-Brutalist fullscreen modal in `src/components/blog/ImageLightboxModal.jsx`:
    - **Multi-Level Zoom**: Zoom in (`+25%` increments up to `400%`), Zoom out (`-25%` down to `50%`), and Reset (`100%`).
    - **Gesture & Mouse Controls**: Double-click toggles 1x/2x zoom instantly. Mouse-wheel scrolls zoom in/out smoothly.
    - **Panning**: When zoomed above `100%`, cursor switches to `grab`/`grabbing`, allowing click-and-drag panning across large diagrams without losing viewport context.
    - **Keyboard & Touch Accessibility**: `Escape` key immediately closes the viewer. Backdrop click dismisses. Tab navigation with focus rings.
    - **Header & Footer Controls**: High-contrast brutalist header displaying image caption/filename, zoom percentage indicator, "Open Original in New Tab" link, and close (`X`) button.
- **BlogPostPage Integration**:
  - Added interactive `lightboxImage` state to `BlogPostPage.jsx`.
  - Wrapped cover image in a focusable, clickable card with `cursor-zoom-in` and hover microcopy.
  - Overrode ReactMarkdown `components.img` to render images with `cursor-zoom-in`, hover borders, and click handlers opening the lightbox with original source and caption.

### 15. Sticky Table of Contents & Metadata Sidebar in Blog Reader
- **Problem & Symptoms**:
  - On the public article reader page (`/blogs/:slug`), the sidebar containing the Table of Contents and article metadata scrolled out of view immediately, leaving readers with no navigation context while reading long articles.
- **Root Cause Discovered**:
  - In `BlogPostPage.jsx`, the parent 2-column container was declared as: `<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">`.
  - In CSS Grid specifications, `items-start` aligns all grid columns to the start of the row, collapsing each column's height to its own content height. Consequently, `<aside>` was only ~400px tall, giving the inner `sticky` container zero scroll track to traverse alongside `<main>`.
  - The sticky offset was `top-6` (24px), which placed the sidebar directly behind the fixed public navbar (`h-16`, 64px, `sticky top-0 z-40`).
- **Fixes Applied**:
  1. **Grid Stretch Alignment**:
     - Removed `items-start` from the grid container, restoring default `align-self: stretch` on `<aside>` so it spans the entire vertical height of the article `<main>`.
  2. **Navbar Clearance & Viewport Containment**:
     - Updated sticky position from `sticky top-6` to `sticky top-20` (80px), providing 16px of comfortable breathing room below the 64px navbar.
     - Added `max-h-[calc(100vh-6rem)] overflow-y-auto pr-1` so that long Tables of Contents scroll internally within the sidebar without being clipped or breaking page scroll.

### 16. Dynamic Frequency-Prioritized Tag Suggestions Engine in Blog Editor
- **Problem & Scope**:
  - In `BlogEditor.jsx`, tag suggestions were hardcoded to a static predefined array (`SUGGESTED_TAGS`).
  - As new articles were written with custom domain tags (e.g. `Kubernetes`, `Docker`, `Microservices`), these tags never appeared in suggestions.
  - The user requested: keep existing suggestions, aggregate all already-used tags from Firestore blogs, display already-used tags first (sorted by frequency of use), deduplicate, and limit suggestions to the top 15.
- **Implementation & Algorithm (`blogUtils.js`)**:
  - Created `getTopSuggestedTags(usedSources, activeTags, baseSuggestions, maxCount)` in `src/utils/blogUtils.js`:
    1. **Frequency Histogram**: Aggregates all tags across all Firestore blogs or strings into a lowercase frequency map:
       $$\text{tagCount}(\text{tag}) = \sum_{p \in \text{blogs}} \mathbb{I}(\text{tag} \in p.\text{tags})$$
    2. **Descending Frequency Sort**: Sorts already-used tags by usage count descending, with secondary alphabetical sorting.
    3. **Prioritized Insertion**: Appends already-used tags first, skipping any tags currently selected in `activeTags`.
    4. **Base Suggestions Fill**: Fills remaining available slots from `SUGGESTED_TAGS` that haven't been used or selected yet.
    5. **Deduplication & Top 15 Cap**: Case-insensitive deduplication while preserving original casing, capping results at `maxCount = 15`.
- **BlogEditor Integration**:
  - Added `availableUsedTags` state in `BlogEditor.jsx`.
  - Added an initial `useEffect` querying `collection(db, "blogs")` to collect all existing tags across the publication database.
  - Memoized suggestions via `useMemo(() => getTopSuggestedTags(availableUsedTags, tags, SUGGESTED_TAGS, 15), [availableUsedTags, tags])`.
  - Updated `handleSave` to immediately append current article tags into `availableUsedTags`, ensuring newly saved tags appear immediately in the suggestion pool without a page reload.

### 17. Cloudinary-Exclusive Markdown Image Upload Pipeline & Base64 Elimination
- **Problem & Root Cause**:
  - In earlier iterations, selecting an image file in the dropper modal fell back to generating in-memory Base64 Data URLs (`data:image/...;base64,...`) when inserted directly.
  - Inserting massive Base64 strings bloated Markdown files from a few kilobytes into several megabytes, degrading Firestore document write limits (1 MB limit per document), rendering speeds, and network transfer performance.
  - Images lacked organization within Cloudinary, scattering assets across default folders rather than grouping them per blog post.
- **Architectural Fixes Applied**:
  1. **Base64 Purge & Cloudinary-Exclusive Requirement**:
     - Completely removed inline Base64 data URL insertion from `BlogImageDropperModal.jsx`.
     - The "Insert Image" button is disabled until Cloudinary returns a valid HTTPS CDN URL (`https://res.cloudinary.com/...`).
     - Removed the "Use as Embedded Base64 Image" error button; only "Retry Cloudinary Upload" is offered on transient network failures.
  2. **Scoped Folder Hierarchy (`blog/{blog-slug}`)**:
     - All article media uploads (direct file picker in dropper modal, drag-and-drop onto the drop zone, and in-place replacements) are routed to a scoped Cloudinary folder: `blog/${slug || slugifyTitle(title) || 'draft'}`.
     - Preserves asset organization in Cloudinary console, grouping all diagrams, screenshots, and assets belonging to a specific post in one location.
  3. **Metadata & Token Ingestion**:
     - The insertion callback in `BlogImageDropperModal.jsx` passes `{ url, alt, caption, public_id, delete_token }` to `onInsertImage`, recording upload tokens for downstream zero-credential client-side asset lifecycle management.

### 18. In-Preview Image Replace & Delete Actions with Cloudinary Sync
- **Problem & Scope**:
  - Previously, removing or changing an image inserted into an article required manually hunting through raw Markdown text, deleting syntax brackets, and left orphaned images consuming storage quota on Cloudinary.
  - Authors needed a direct, visual way to delete or replace images in the article preview while keeping Cloudinary storage synchronized.
- **Implementation & Architecture**:
  1. **Interactive Preview Image Overlays (`MarkdownPreview.jsx`)**:
     - Added `editable={true}`, `onDeleteImage`, and `onReplaceImage` props to `MarkdownPreview.jsx`.
     - In editable mode, custom `img` rendering wraps every Markdown image in a Neo-Brutalist card with:
       - Header displaying image `alt` text or filename and a `CLOUDINARY` status badge.
       - Quick action toolbar:
         - **Replace Button** (with `RefreshCw` icon): Prompts for a replacement image file and swaps the asset in-place.
         - **Delete Button** (with `Trash2` icon): Prompts for confirmation, deletes asset from Cloudinary, and strips the Markdown syntax from the article.
  2. **Robust Markdown Manipulation Utilities (`blogUtils.js`)**:
     - `removeImageFromMarkdown(content, imageSrc)`: Removes matching `![alt](url)` and `<img src="url" />` tags, cleaning up leftover blank lines and orphaned captions without affecting surrounding text.
     - `replaceImageInMarkdown(content, oldSrc, newSrc, newAlt)`: Matches and swaps the image URL in-place at the exact cursor/document position, preserving user captions and surrounding paragraphs.
     - Regex safety with `escapeRegExp` ensuring URLs containing special characters (query params, slashes, dashes) are handled without escaping errors.
  3. **Cloudinary Asset Destruction & Public ID Extraction (`cloudinary.js`)**:
     - `extractCloudinaryPublicId(url)`: Robustly parses Cloudinary CDN URLs to extract public IDs by identifying version tag boundaries (`v\d+/`), handling transforms, and supporting scoped subfolder paths (`blog/slug/image-name`).
     - `deleteFromCloudinary(publicIdOrUrl, options)`: Supports client-side deletion using unsigned upload `delete_token` via `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, falling back to destroy endpoints. Operates non-destructively so UI updates succeed even if remote asset deletion is restricted by Cloudinary preset permissions.
  4. **Integrated Lifecycle Management in `BlogEditor.jsx`**:
     - Maintains `imageTokensRef` in-memory map tracking `{ publicId, deleteToken }` for all uploaded images.
     - `handleDeleteImage`: Deletes from Cloudinary and calls `removeImageFromMarkdown`.
     - `handleReplaceImage`: Activates a hidden file input (`replacementFileInputRef`), uploads the replacement file to `blog/${slug}`, invokes `deleteFromCloudinary` on the old asset, calls `replaceImageInMarkdown`, and updates token mapping.

### 19. Blog Slug Immutability & Asset Hierarchy Protection
- **Problem & Architectural Risk**:
  - The blog slug directly determines:
    1. Public routing URLs (`/blogs/:slug`).
    2. Cloudinary folder paths (`blog/:slug`).
    3. Asset deletion and replacement boundaries.
  - Allowing authors to edit the slug after initial creation would break incoming bookmarked links, cause 404s, and orphan Cloudinary folders/assets uploaded under previous slugs.
- **Implementation**:
  - In `BlogEditor.jsx`, the slug input field is made permanently **immutable**:
    - `readOnly={true}` and `disabled={true}` with `cursor-not-allowed` styling.
    - Prominent `LOCKED` badge rendered adjacent to the slug label.
    - Helpful explanatory microcopy: `Slug is permanently locked to preserve SEO, public URL routing, and the Cloudinary storage path (blog/{slug}).`
    - Live Cloudinary destination preview displayed below the field (`Destination: blog/{slug || '...'}`).
  - On new article creation (`!id`), the slug is automatically derived from the title as the author types until the article is initially saved, after which it remains strictly immutable.

### 20. Blog Image Dropper Modal Abort Lifecycle & Button Enablement Fix
- **Problem & Symptoms**:
  - In `BlogImageDropperModal.jsx`, when an image was selected via file picker or drag-and-drop, the "Insert Image Markdown" button stayed permanently disabled.
  - However, typing any character into the "External Image URL" tab immediately enabled the button.
- **Root Cause Discovered**:
  - `BlogImageDropperModal.jsx` had a `useEffect` with dependency `[previewUrl]` whose cleanup callback called `abortControllerRef.current.abort()`.
  - When the user selected a file, `handleFileSelected` set `previewUrl` to `URL.createObjectURL(file)` while simultaneously invoking `executeUpload(file)`.
  - The state update triggered React to re-render, executing the previous effect's cleanup and immediately aborting the in-flight Cloudinary upload with `AbortError`.
  - Because `executeUpload` silently caught `AbortError`, `uploadedUrl` was never populated, leaving the insert button disabled.
- **Fixes Applied**:
  - Moved `abortControllerRef` and object URL cleanup strictly to component unmount (`useEffect(..., [])`).
  - Stored blob object URLs in `blobUrlRef` and manually revoked previous blob URLs in `handleFileSelected` and `handleModalClose`.
  - Upload now executes to completion without premature cancellation, populating `uploadedUrl` and enabling the insert button as expected.

---

## 5. Verification & Test Suite Status

- **Automated Test Suite**: **129 tests passing** (0 failures, 0 skipped) across all vertical slices + theme engine + blog suite:
  - `slice-1.1` to `slice-1.3`: Brutalist primitives & Cloudinary service.
  - `slice-2.1` to `slice-2.3`: AuthContext, ProtectedRoute, AdminLayout.
  - `slice-3.1` to `slice-3.4`: ProfileCMS, SkillsCMS, ExperienceCMS, Seeder.
  - `slice-4.1` to `slice-4.4`: ProjectsCMS, ProjectEditor, CaseStudyDrawer.
  - `slice-5.1` to `slice-5.4`: BlogEditor, CloudinaryDropper, BlogsCMS, Tag Suggestions algorithm, in-preview image Replace/Delete, and slug lock.
  - `slice-6.1` to `slice-6.3`: BlogsPage, BlogPostPage reader, ImageLightboxModal, ProjectsPage catalog.
  - `slice-7.1` to `slice-7.4`: Bento Homepage, HeroTile, Image optimization, Smoke tests.
  - `slice-theme`: Theme Engine, Anti-FOUC, and ThemeToggle SSR.
- **Linter**: `0` errors, `0` warnings (`npm run lint`).
- **Production Compilation**: Clean Vite build (`npm run build`) in ~8.4s with optimized manual code-splitting chunks.

---

## 6. Active Environment Variables

```bash
# Cloudinary Media Pipeline
VITE_CLOUDINARY_CLOUD_NAME=dsdqo228u
VITE_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned

# Firebase Configuration (portfolio-c6f29)
VITE_FIREBASE_API_KEY=AIzaSyAzasoo8Y7Tt7V_n0Ct7yzR0d1APDyBJ9M
VITE_FIREBASE_AUTH_DOMAIN=portfolio-c6f29.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=portfolio-c6f29
VITE_FIREBASE_STORAGE_BUCKET=portfolio-c6f29.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=350726943938
VITE_FIREBASE_APP_ID=1:350726943938:web:6ab5e6de3177b611ce375b

# Admin Authorization
VITE_ADMIN_EMAIL=piyushbhagwat5@gmail.com
```

---

## 7. Current Project Structure

```
portfolio/
├── .env                                       # Local environment secrets
├── tailwind.config.js                         # Neo-Brutalist & Bento styling tokens
├── vite.config.js                             # Chunk code-splitting & build pipeline
├── test/                                      # 129 automated vertical slice tests
├── V2/
│   ├── architecture.md                        # Component hierarchy & data contracts
│   ├── context.md                             # [This File] Persistent project memory
│   ├── edge-case.md                           # Edge-case & failure mode mitigations
│   └── implimentation.md                      # Sliced implementation plan & post-launch slices
└── src/
    ├── components/
    │   ├── brutalist/                         # BentoCard, BrutalButton, TagBadge, ThemeToggle, etc.
    │   ├── common/                            # ImageUploader, ProtectedRoute
    │   ├── home/                              # 6 Bento Tiles (HeroTile, StatusTile, etc.)
    │   ├── project/                           # ProjectCard, CaseStudyModal, CaseStudyDrawer
    │   └── blog/                              # BlogCard, BlogImageDropperModal, MarkdownEditorToolbar, MarkdownPreview, ImageLightboxModal
    ├── context/
    │   ├── AuthContext.jsx                    # Firebase authentication state provider
    │   └── ThemeContext.jsx                   # Dark/Light theme state and persistence provider
    ├── hooks/
    │   ├── useAuth.js                         # Firebase authentication hook
    │   └── useTheme.js                        # Theme consumption hook
    ├── layouts/
    │   └── AdminLayout.jsx                    # Administrative CMS sidebar & navigation
    ├── pages/
    │   ├── admin/                             # Overview, ProfileCMS, SkillsCMS, ExperienceCMS,
    │   │                                      # ProjectsCMS, BlogsCMS, BlogEditor, Login
    │   └── public/                            # HomePage (Bento), ProjectsPage, BlogsPage, BlogPostPage
    ├── services/
    │   ├── cloudinary.js                      # Media upload & transformation service
    │   └── firebase.js                        # Firebase Auth & Cloud Firestore
    └── scripts/
        └── seedData.js                        # Canonical Firestore data seeder
```

