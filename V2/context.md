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
  - **Design System**: Neo-Brutalist Bento-Grid developer aesthetic (dark mode `#09090b`, `#121215`, high-contrast borders `border-zinc-800`/`border-zinc-700`, hard offset shadows `shadow-brutal`, `terminal-green` / `terminal-cyan` accents, `JetBrains Mono` + `Inter` typography).

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

---

## 5. Verification & Test Suite Status

- **Automated Test Suite**: **108 tests passing** (0 failures, 0 skipped) across all vertical slices:
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
├── test/                                      # 108 automated vertical slice tests
├── V2/
│   ├── architecture.md                        # Component hierarchy & data contracts
│   ├── context.md                             # [This File] Persistent project memory
│   ├── edge-case.md                           # Edge-case & failure mode mitigations
│   └── implimentation.md                      # 7-Day implementation plan
└── src/
    ├── components/
    │   ├── brutalist/                         # BentoCard, BrutalButton, TagBadge, etc.
    │   ├── common/                            # ImageUploader, ProtectedRoute
    │   ├── home/                              # 6 Bento Tiles (HeroTile, StatusTile, etc.)
    │   ├── project/                           # ProjectCard, CaseStudyModal, CaseStudyDrawer
    │   └── blog/                              # BlogCard, CloudinaryDropperModal
    ├── context/
    │   └── AuthContext.jsx                    # Firebase authentication state provider
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
