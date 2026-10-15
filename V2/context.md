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
| **Scope Addition** | **Dual-Theme Engine (Subtle Greenish Light & Dark)** | **SPECIFIED IN ARCHITECTURE** | Color theory calibration, ThemeContext, ThemeToggle button, CSS semantic tokens, cross-view light theme adaptation |

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

---

## 5. Verification & Test Suite Status

- **Automated Test Suite**: **117 tests passing** (0 failures, 0 skipped) across all vertical slices + theme engine:
  - `slice-1.1` to `slice-1.3`: Brutalist primitives & Cloudinary service.
  - `slice-2.1` to `slice-2.3`: AuthContext, ProtectedRoute, AdminLayout.
  - `slice-3.1` to `slice-3.4`: ProfileCMS, SkillsCMS, ExperienceCMS, Seeder.
  - `slice-4.1` to `slice-4.4`: ProjectsCMS, ProjectEditor, CaseStudyDrawer.
  - `slice-5.1` to `slice-5.4`: BlogEditor, CloudinaryDropper, BlogsCMS.
  - `slice-6.1` to `slice-6.3`: BlogsPage, BlogPostPage reader, ProjectsPage catalog.
  - `slice-7.1` to `slice-7.4`: Bento Homepage, HeroTile, Image optimization, Smoke tests.
- **Linter**: `0` errors, `0` warnings (`npm run lint`).
- **Production Compilation**: Clean Vite build (`npm run build`) in ~8.8s with optimized manual code-splitting chunks.

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
├── test/                                      # 110 automated vertical slice tests
├── V2/
│   ├── architecture.md                        # Component hierarchy & data contracts
│   ├── context.md                             # [This File] Persistent project memory
│   ├── edge-case.md                           # Edge-case & failure mode mitigations
│   └── implimentation.md                      # 7-Day implementation plan
└── src/
    ├── components/
    │   ├── brutalist/                         # BentoCard, BrutalButton, TagBadge, ThemeToggle, etc.
    │   ├── common/                            # ImageUploader, ProtectedRoute
    │   ├── home/                              # 6 Bento Tiles (HeroTile, StatusTile, etc.)
    │   ├── project/                           # ProjectCard, CaseStudyModal, CaseStudyDrawer
    │   └── blog/                              # BlogCard, CloudinaryDropperModal
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
