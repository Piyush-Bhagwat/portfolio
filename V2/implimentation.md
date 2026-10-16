# Portfolio V2 — 7-Day Sliced Implementation Plan

This document details the day-by-day, vertically-sliced execution plan for transitioning the portfolio to **V2** within a 7-day sprint. Each day represents a **complete vertical slice**—delivering UI, business logic, integrations, and verification—ensuring the codebase remains testable and deployable at every step.

---

## Sprint Overview & Daily Cadence

```
+---------------------------------------------------------------------------------------------------------+
|                                    7-DAY RAPID EXECUTION MATRIX                                         |
+-------+---------------------------------------------+---------------------------------------------------+
| Day   | Theme / Focus                               | Deliverables & Value Provided                     |
+-------+---------------------------------------------+---------------------------------------------------+
| Day 1 | Foundations, Design Tokens & Cloudinary     | Tailwind setup, Neo-Brutalist primitives, Upload  |
| Day 2 | Auth, Session Guard & Admin Shell           | Firebase Auth, Protected Routes, CMS Shell        |
| Day 3 | Profile, Skills & Experience CMS            | Dynamic Profile, Skills/Timeline CRUD, DB Seeder  |
| Day 4 | Projects & Case Studies Engine              | Dynamic Projects, Deep Case Study CMS & Migration |
| Day 5 | Blog Engine: Admin Editor & Media Pipeline  | Split Markdown Editor, Cloudinary Drop, CMS Table |
| Day 6 | Public Blog Reader & Case Study Showcase    | Blog Index, Code Syntax Reader, Case Study Drawers|
| Day 7 | Bento-Grid Homepage, Polish & Cutover       | Bento Redesign, Micro-interactions, SEO, Launch   |
| Day 8+| Blog Suite & Media Pipeline Hardening      | Split scroll sync, Lightbox, Sticky TOC, Top 15 Tags, Cloudinary-Only Media, In-Preview Actions, Locked Slug|
| Day 9+| Comments, Ratings & Admin Interact Suite   | Decoupled comments, 3-to-10 cursor pagination, 3-tier sidebar, Card rating pills, Cross-post Interact CMS, Soft-delete & author replies|
+-------+---------------------------------------------+---------------------------------------------------+
```

---

## Day 1: Foundation, Design Tokens & Cloudinary Asset Service

### Goal
Establish the design system foundation (Tailwind CSS, monospace typography, Neo-Brutalist UI primitives) and the Cloudinary media pipeline so every subsequent day can immediately render assets and brutalist UI.

### Vertical Slices
- **Slice 1.1: Styling Infrastructure & Tokens**
  - Install Tailwind CSS, `@tailwindcss/typography`, `lucide-react`, and configure font families (`Geist`/`Inter` + `JetBrains Mono`).
  - Configure brutalist utility tokens in `tailwind.config.js`:
    - Hard shadows: `shadow-brutal: '4px 4px 0px 0px rgba(0,0,0,1)'` and `shadow-brutal-sm: '2px 2px 0px 0px rgba(0,0,0,1)'`
    - High-contrast border palette: `border-zinc-800`, `border-zinc-700`
    - Terminal colors: `terminal-green: '#10b981'`, `terminal-cyan: '#06b6d4'`, `terminal-bg: '#09090b'`
- **Slice 1.2: Neo-Brutalist & Bento Primitives**
  - Create `src/components/brutalist/BentoCard.jsx` (container with subtle dot grid, hover elevation, crisp border).
  - Create `src/components/brutalist/BrutalButton.jsx` (tactile press offset, high contrast).
  - Create `src/components/brutalist/TagBadge.jsx` (monospace tag pill with custom border).
  - Create `src/components/brutalist/TerminalBox.jsx` (macOS/Linux dot header, title, code styling).
  - Create `src/components/brutalist/StatusPill.jsx` (`● Available for work` animated pulse dot).
- **Slice 1.3: Cloudinary Integration Layer**
  - Create `src/services/cloudinary.js`:
    - Direct unsigned upload function `uploadToCloudinary(file, folder)`.
    - URL transformation helper `getOptimizedImageUrl(url, { width, height, crop, format })`.
  - Create a sandboxed test component `src/components/common/ImageUploader.jsx` with drag-and-drop, upload progress bar, and instant thumbnail preview.

### Target Files
```
/
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── styles/
│   │   ├── index.css
│   │   └── brutalist.css
│   ├── services/
│   │   └── cloudinary.js
│   └── components/
│       ├── brutalist/
│       │   ├── BentoCard.jsx
│       │   ├── BrutalButton.jsx
│       │   ├── TagBadge.jsx
│       │   ├── TerminalBox.jsx
│       │   └── StatusPill.jsx
│       └── common/
│           └── ImageUploader.jsx
```

### Acceptance & Verification
1. `npm run dev` builds with zero Tailwind compilation warnings.
2. An image uploaded through `ImageUploader` successfully reaches Cloudinary, generates an `https://res.cloudinary.com/...` URL, and verifies image delivery in browser.
3. Brutalist primitives render cleanly in dark mode with crisp borders and tactile offsets.

---

## Day 2: Authentication, Security & Base Admin Shell

### Goal
Implement secure Firebase Authentication, protected routes, and an administrative shell so that all content management forms can be built safely within a unified layout.

### Vertical Slices
- **Slice 2.1: Firebase Auth Configuration & Service**
  - Configure `src/services/firebase.js` with `getAuth(app)`.
  - Implement login with email/password and restrict access to the authorized administrator email.
- **Slice 2.2: Auth Context & Route Protection**
  - Create `src/context/AuthContext.jsx` exposing `{ user, loading, login, logout, isAdmin }`.
  - Create `src/components/common/ProtectedRoute.jsx` that intercepts unauthenticated requests and redirects to `/admin/login` while preserving return paths.
- **Slice 2.3: Admin Navigation Shell (`AdminLayout`)**
  - Create `src/layouts/AdminLayout.jsx`:
    - Responsive sidebar: Overview, Profile & Bio, Projects & Cases, Skills & Milestones, Blogs, Logout.
    - Top bar: Admin email display, quick link to public portfolio, live status indicator.
  - Create `/admin/login` page with brutalist terminal-style login box.
- **Slice 2.4: Firestore Security Rules**
  - Draft `firestore.rules` enforcing public read access and authenticating write access solely to `request.auth.token.email == "piyushbhagwat5@gmail.com"`.

### Target Files
```
src/
├── services/
│   └── firebase.js
├── context/
│   └── AuthContext.jsx
├── components/
│   └── common/
│       └── ProtectedRoute.jsx
├── layouts/
│   └── AdminLayout.jsx
├── pages/
│   └── admin/
│       ├── Login.jsx
│       └── Overview.jsx
firestore.rules
```

### Acceptance & Verification
1. Accessing `/admin` while unauthenticated redirects automatically to `/admin/login`.
2. Logging in with valid credentials grants access to `/admin/overview` and persists session on page reload.
3. Non-whitelisted users are rejected with an access-denied message.

---

## Day 3: Profile, Skills & Experience CMS

### Goal
Make all personal bio information, hero statements, skills, and work experience 100% dynamic and editable, and seed initial Firestore data from the current portfolio.

### Vertical Slices
- **Slice 3.1: Profile & Bio CMS (`/admin/profile`)**
  - Form fields: Full Name, Role, Hero headline, Bio paragraphs (array/multiline), Location, Status badge text, Resume URL.
  - Socials manager: Add/edit platform, URL, icon.
  - Cloudinary avatar uploader integrated directly with immediate preview.
  - Firestore document reference: `site_config/profile`.
- **Slice 3.2: Skills CMS (`/admin/skills`)**
  - Tabbed category manager: Frontend, Backend, Database, Tools.
  - Add/Edit modal: Skill name, category, icon upload (Cloudinary) or SVG/icon name, display order.
  - Delete and reorder capability.
  - Firestore collection: `skills`.
- **Slice 3.3: Experience & Milestones CMS (`/admin/experience`)**
  - Timeline editor: Role, Company/Organization, Period/Dates, Description, Key skills used, Display order.
  - Firestore collection: `experiences`.
- **Slice 3.4: Initial Data Seeding Script**
  - Create `src/scripts/seedData.js` (callable via an admin button or console) to seed current V1 bio, skills (React, Vue, Node, etc.), and socials to Firestore if empty.

### Target Files
```
src/
├── pages/
│   └── admin/
│       ├── ProfileCMS.jsx
│       ├── SkillsCMS.jsx
│       └── ExperienceCMS.jsx
├── hooks/
│   └── useFirestore.js
└── scripts/
    └── seedData.js
```

### Acceptance & Verification
1. Admin can update their bio, change the headline, upload a new avatar via Cloudinary, and save to Firestore.
2. Admin can create, modify, or delete a skill, with updates immediately reflected in Firestore.
3. Seeding script successfully initializes `site_config/profile` and `skills` collections.

---

## Day 4: Projects & Case Studies Engine

### Goal
Replace static `src/projects.js` with a full-featured Projects and Structured Case Studies CMS in Firestore, allowing deep-dive technical project writeups.

### Vertical Slices
- **Slice 4.1: Projects CRUD Manager (`/admin/projects`)**
  - Project list view with search, edit, delete, and feature toggle.
  - Project Editor: Title, Slug, Short description, Tech stack tags, Date, Live URL, GitHub URL, Display order.
  - Cloudinary cover banner uploader.
- **Slice 4.2: Structured Case Study Builder**
  - Case Study toggle (`enabled: true/false`).
  - Motivation / Problem Statement text area (`why`).
  - Tech stack rationale breakdown list (`tech` + why chosen).
  - Key learnings tag list.
  - Interactive Q&A challenges manager: Add/edit/remove problem cards (`{ que: string, ans: string }`).
- **Slice 4.3: Legacy Project Data Migration**
  - Script to import existing 6 projects and case studies (`Notes Pool`, `Dictionary`, `Flash Card`, etc.) from `src/projects.js` into the Firestore `projects` collection.

### Target Files
```
src/
├── pages/
│   └── admin/
│       ├── ProjectsCMS.jsx
│       └── ProjectEditorModal.jsx
├── components/
│   └── admin/
│       └── CaseStudyFields.jsx
└── scripts/
    └── migrateLegacyProjects.js
```

### Acceptance & Verification
1. All 6 legacy projects from `src/projects.js` are migrated into Firestore with all case study fields (`why`, `learning`, `problems`).
2. Creating a new project with an image upload and case study Q&A saves properly and loads in edit mode without data loss.

---

## Day 5: Technical Blog System — Admin CMS & Media Pipeline

### Goal
Build the complete authoring and management environment for articles, featuring a split-screen Markdown editor with live preview and integrated Cloudinary image ingestion.

### Vertical Slices
- **Slice 5.1: Split-Screen Markdown Editor (`/admin/blogs/new` & `.../edit/:id`)**
  - Left pane: Code/Markdown input with line numbers and quick formatting toolbars (Headings, Code, Bold, Link).
  - Right pane: Real-time Markdown preview with `react-markdown` + `remark-gfm` + syntax highlighting.
  - Auto-scrolling synchronization between editor and preview.
- **Slice 5.2: In-Editor Cloudinary Image Dropper**
  - Drag-and-drop or file picker button inside editor toolbar.
  - Automatically uploads image to Cloudinary folder `portfolio/blogs`, returns the optimized CDN URL, and injects `![alt](https://res.cloudinary.com/...)` directly into the editor cursor position.
- **Slice 5.3: Post Metadata & Publishing Controls**
  - Title input with automatic slugifier (`my-new-post` &rarr; check uniqueness).
  - Excerpt input (short teaser for cards).
  - Tags input (e.g. `React`, `System Design`).
  - Cover image uploader (Cloudinary).
  - Automatic reading time calculation (`Math.ceil(words / 200)` min read).
  - Status toggle: `Draft` vs. `Published`.
- **Slice 5.4: Blog Manager Table (`/admin/blogs`)**
  - List of all articles with status badges (`DRAFT` / `PUBLISHED`), created/updated dates, and read time.
  - Quick action buttons: Preview, Edit, Toggle Publish/Draft, Delete with confirmation modal.

### Target Files
```
src/
├── pages/
│   └── admin/
│       ├── BlogsCMS.jsx
│       └── BlogEditor.jsx
├── components/
│   ├── blog/
│   │   ├── MarkdownEditorToolbar.jsx
│   │   └── MarkdownPreview.jsx
│   └── common/
│       └── ConfirmModal.jsx
```

### Acceptance & Verification
1. Admin can draft a post in markdown, drop an image to insert its Cloudinary URL, and see the formatted preview side-by-side.
2. Saving stores `content_markdown`, `slug`, `tags`, `read_time_minutes`, and `published` status in Firestore `blogs` collection.
3. Toggling draft/published updates the state instantly in the admin table.

---

## Day 6: Public Blog Reader & Case Study Showcase

### Goal
Deliver the public-facing blog experience and interactive project case studies, turning the portfolio into a technical reading destination.

### Vertical Slices
- **Slice 6.1: Public Blog Index (`/blogs`)**
  - Bento/Card grid of published posts.
  - Card components: Cover image, title, excerpt, publication date, read-time badge, tag badges.
  - Real-time client-side search bar and clickable tag filter pills.
- **Slice 6.2: Public Article Reader (`/blogs/:slug`)**
  - Dynamic route looking up post by `slug`.
  - Top header: Post title, publication date, author badge, read time, tags, cover banner.
  - Clean reading layout (`prose prose-invert max-w-3xl`).
  - Code syntax highlighting with language labels and 1-click copy-to-clipboard button.
  - Sticky reading progress bar at top of viewport.
  - Auto-generated Table of Contents linking to markdown headings.
- **Slice 6.3: Public Projects Page & Interactive Case Study Drawer**
  - Revamp `/projects` into a clean grid of project cards with live links, repo links, and tech badges.
  - "Read Case Study" button opens a sliding drawer or modal displaying:
    - Motivation / "Why it was built"
    - Architectural decisions & tech breakdown
    - Expandable accordion of Challenges & Solutions (`problems: [{que, ans}]`).

### Target Files
```
src/
├── pages/
│   └── public/
│       ├── BlogsPage.jsx
│       ├── BlogPostPage.jsx
│       └── ProjectsPage.jsx
├── components/
│   ├── blog/
│   │   ├── BlogCard.jsx
│   │   ├── CodeBlock.jsx
│   │   ├── TableOfContents.jsx
│   │   └── ReadingProgressBar.jsx
│   └── project/
│       ├── ProjectCard.jsx
│       └── CaseStudyModal.jsx
```

### Acceptance & Verification
1. Navigating to `/blogs` displays only published posts, with instant tag filtering and search filtering.
2. Clicking a post opens `/blogs/:slug`, renders markdown code blocks with syntax highlighting and copy buttons, and updates the reading progress bar as the user scrolls.
3. Clicking "Read Case Study" on `/projects` opens the rich case study drawer with expandable challenge accordions.

---

## Day 7: Bento-Grid Homepage Redesign, Polish & Final Cutover

### Goal
Completely replace the outdated homepage with the modern Bento-Grid & Neo-Brutalist developer aesthetic, perform cross-device optimizations, and execute cutover.

### Vertical Slices
- **Slice 7.1: Bento-Grid Homepage Architecture (`/`)**
  - **Tile 1 (Hero - 2x2)**: Terminal window `$ whoami` with dynamic name, role, bio from Firestore, and brutalist CTA buttons.
  - **Tile 2 (Status - 1x1)**: Pulsing status pill (`● Available for work`), current location, local time (IST).
  - **Tile 3 (Socials & Links - 1x1)**: Monospace link dock with GitHub, LinkedIn, X, Resume download.
  - **Tile 4 (Tech Stack Marquee / Bento - 2x1)**: Interactive skill badges loaded dynamically from `skills` collection.
  - **Tile 5 (Latest Article Feature - 1x1)**: Bento card highlighting the most recent published blog post.
  - **Tile 6 (Featured Projects Spotlight - 3x2)**: Interactive cards for top projects with case study access.
- **Slice 7.2: Responsive Polish & Brutalist Micro-Interactions**
  - Tactile button presses (`active:translate-x-[2px] active:translate-y-[2px]`).
  - Subtle `framer-motion` entrance animations for bento tiles.
  - Responsive layout check: Single-column on mobile &rarr; 2-column on tablet &rarr; 4-column Bento grid on desktop.
- **Slice 7.3: Performance & Lighthouse Optimization**
  - Ensure all Cloudinary URLs use `f_auto,q_auto`.
  - Lazy load heavy components (Markdown reader, code highlighter).
  - Clean up legacy CSS files (`main.style.css`, `mobile.style.css`, unused bundled images).
- **Slice 7.4: Production Verification Checklist**
  - End-to-end smoke test of all public and admin routes.
  - Check Firestore reads/writes efficiency.
  - Production build verification (`npm run build`).

### Target Files
```
src/
├── pages/
│   └── public/
│       └── HomePage.jsx
├── components/
│   ├── home/
│   │   ├── HeroTile.jsx
│   │   ├── StatusTile.jsx
│   │   ├── SkillsTile.jsx
│   │   ├── FeaturedProjectsTile.jsx
│   │   └── LatestBlogTile.jsx
│   └── layout/
│       ├── PublicNavbar.jsx
│       └── PublicFooter.jsx
```

### Acceptance & Verification
1. Homepage displays the high-contrast Bento-Grid layout populated entirely from dynamic Firestore data.
2. Responsive navigation works seamlessly from mobile (hamburger menu) to widescreen displays.
3. `npm run build` succeeds with zero errors and no bundle size warnings.

---

## Post-Cutover: Blog Suite Hardening, Cloudinary Pipeline & Viewer Capabilities

### Goal
Resolve authoring usability friction in the split-screen Markdown studio, provide a responsive fullscreen media viewer for public readers, ensure seamless table of contents tracking during deep reading, enhance categorization workflows with intelligent frequency-ranked tag suggestions, purge embedded Base64 strings in favor of an optimized Cloudinary-exclusive pipeline under `blog/{slug}`, implement in-preview image deletion and in-place replacement, and enforce permanent slug immutability.

### Vertical Slices

- **Slice 5.5: Markdown Editor Studio Flex-Containment & Synchronized Scrolling**
  - Fix Flexbox scroll clipping in `BlogEditor.jsx` by establishing strict viewport bounds (`h-[620px] max-h-[calc(100vh-200px)]`) and `min-h-0` flex containment.
  - Enable `bodyClassName` on `TerminalBox.jsx` to eliminate hardcoded card padding when hosting zero-margin full-bleed split panes.
  - Implement bidirectional scroll event handlers with a 50ms cooldown lock (`isScrollingRef`) to prevent infinite scroll loops and jitter when `syncScroll` is active.
  - Synchronize line numbers gutter scroll position with textarea `scrollTop` (`lineNumbersRef`).
  - Strip conflicting inner `overflow-y-auto` from `MarkdownPreview.jsx`.

- **Slice 5.6: Blog Image Dropper Direct Upload & Embedded Base64 Fallback Pipeline**
  - In `BlogImageDropperModal.jsx`, implement immediate in-memory Data URL generation via `FileReader` on file selection, unblocking the "Insert Image" button instantaneously.
  - Add error recovery buttons ("Retry Cloudinary Upload" & "Use as Embedded Base64 Image") for offline or unconfigured environments.
  - Clear modal state on reopen and add `onClick={(e) => { e.target.value = null; }}` on the file input to support repeated selections of identical filenames.

- **Slice 5.7: Dynamic Frequency-Prioritized Tag Suggestions Engine**
  - Implement `getTopSuggestedTags(usedSources, activeTags, baseSuggestions, maxCount)` in `src/utils/blogUtils.js`.
  - Fetch existing blog posts from Firestore `collection(db, "blogs")` on `BlogEditor` mount.
  - Calculate tag usage frequencies, sort already-used tags in descending order, append unused base suggestions (`SUGGESTED_TAGS`), deduplicate case-insensitively, filter out currently active tags, and slice to the top 15 suggestions.
  - Dynamically update the suggestion pool when a post is saved.

- **Slice 5.8: Cloudinary-Exclusive Asset Ingestion (`blog/{slug}`) & Base64 Purge**
  - Eliminate all embedded Base64 Data URL injection into Markdown files, preventing document bloat, latency spikes, and Firestore document size limit violations (1MB).
  - Scope all image uploads (file picker, drag-and-drop, and replacement) strictly to folder `blog/${slug || slugifyTitle(title) || 'draft'}`.
  - Require a successful Cloudinary CDN URL (`https://res.cloudinary.com/...`) before enabling the "Insert Image" button in `BlogImageDropperModal.jsx`.
  - Remove the "Use as Embedded Base64 Image" fallback option, keeping "Retry Cloudinary Upload" for transient network failures.
  - Retain upload metadata `{ url, alt, caption, public_id, delete_token }` on insertion to enable zero-credential client-side lifecycle operations.

- **Slice 5.9: In-Preview Image Replace & Delete Operations with Cloudinary Synchronization**
  - Implement `removeImageFromMarkdown(content, imageSrc)` and `replaceImageInMarkdown(content, oldSrc, newSrc, newAlt)` in `src/utils/blogUtils.js` with regex escaping to cleanly strip or swap image tags without affecting surrounding text or captions.
  - Implement `extractCloudinaryPublicId(url)` and `deleteFromCloudinary(publicIdOrUrl, options)` in `src/services/cloudinary.js`, supporting unsigned `delete_token` execution via `delete_by_token` API and graceful fallback.
  - Add `editable={true}`, `onDeleteImage`, and `onReplaceImage` props to `MarkdownPreview.jsx`, rendering an interactive Brutalist card over every article image in editor mode:
    - Image `alt` text / caption label with a `CLOUDINARY` status badge.
    - Prominent **Replace** button (`RefreshCw`) and **Delete** button (`Trash2`).
  - Connect lifecycle handlers in `BlogEditor.jsx`:
    - Track `{ publicId, deleteToken }` in `imageTokensRef`.
    - Delete flow: Confirmation prompt &rarr; calls `deleteFromCloudinary` &rarr; strips Markdown syntax via `removeImageFromMarkdown`.
    - Replace flow: Triggers hidden file input &rarr; uploads new file to `blog/${slug}` &rarr; deletes old asset from Cloudinary &rarr; swaps Markdown URL in-place via `replaceImageInMarkdown`.

- **Slice 5.10: Slug Locking & Path Guarantee**
  - Lock the slug input field in `BlogEditor.jsx` (`readOnly={true}`, `disabled={true}`, `cursor-not-allowed`, and `LOCKED` badge) to permanently preserve public URL routing (`/blogs/:slug`) and Cloudinary storage paths (`blog/:slug`).
  - For new articles (`!id`), auto-generate the slug from title until initial save, after which the slug remains strictly immutable.
  - Render a live Cloudinary destination path preview below the slug field (`Destination: blog/{slug || '...'}`).

- **Slice 6.4: Fullscreen Multi-Level Zoom Lightbox Modal**
  - Create `src/components/blog/ImageLightboxModal.jsx` with Neo-Brutalist aesthetics:
    - Multi-level zoom controls: Zoom In (`+`), Zoom Out (`-`), Reset (`100%`).
    - Mouse-wheel zooming and double-click 1x/2x zoom toggling.
    - Drag-to-pan when image is zoomed beyond 100%.
    - Keyboard (`Escape`) and backdrop click dismissal.
    - Caption display and "Open original in new tab" action.
  - Integrate modal into `BlogPostPage.jsx` for both the cover banner thumbnail and ReactMarkdown `img` component overrides.

- **Slice 6.5: Sticky Table of Contents & Metadata Sidebar with Navbar Clearance**
  - Remove `items-start` from the 2-column grid in `BlogPostPage.jsx` so the `<aside>` element stretches to the full height of the `<main>` article column.
  - Offset sticky sidebar from `top-6` to `top-20` (80px), positioning it 16px below the 64px fixed public navbar.
  - Add `max-h-[calc(100vh-6rem)] overflow-y-auto pr-1` to allow internal scrolling of lengthy Tables of Contents without obstructing window scrolling.

### Target Files
```
src/
├── components/
│   ├── blog/
│   │   ├── BlogImageDropperModal.jsx
│   │   ├── MarkdownPreview.jsx
│   │   ├── ImageLightboxModal.jsx
│   │   └── index.js
│   └── brutalist/
│       └── TerminalBox.jsx
├── pages/
│   ├── admin/
│   │   └── BlogEditor.jsx
│   └── public/
│       └── BlogPostPage.jsx
├── services/
│   └── cloudinary.js
├── utils/
│   └── blogUtils.js
└── test/
    ├── slice-5.1.test.js
    ├── slice-5.2.test.js
    └── slice-6.2.test.js
```

### Acceptance & Verification
1. Raw Markdown textarea and preview pane scroll independently and synchronize proportionally when `syncScroll` is enabled.
2. Selecting an image file in `BlogImageDropperModal` uploads directly to Cloudinary under folder `blog/{slug}` and inserts the CDN URL; no Base64 Data URLs are ever inserted into Markdown.
3. Images in editor live preview render interactive Replace and Delete action buttons. Deleting removes the Markdown syntax and triggers Cloudinary deletion. Replacing prompts for a new file, uploads to `blog/{slug}`, deletes the old asset, and swaps the URL in-place.
4. The article slug is strictly read-only and immutable, safeguarding Cloudinary folder structure and SEO routing.
5. Clicking article images or the cover banner opens the full-featured lightbox with zoom (50%-400%), pan, and keyboard dismiss.
6. The sidebar TOC and metadata remain sticky alongside the article content while scrolling, clearing the public navbar cleanly.
7. Tag suggestions display already-used tags first (ranked by usage frequency), followed by base suggestions, capped at 15, excluding selected tags.
8. All 129 automated tests pass (`npm test`) and production build succeeds (`npm run build`).

---

## Post-Cutover: Comments & Ratings Engine — Public Engagement, Pagination & Admin Interact Moderation

### Goal
Implement a scalable, decoupled community interaction platform for blog posts capable of handling viral discussions without document bloat or read-quota exhaustion. Deliver a 3-tier right sidebar with an expandable comment dock (initial 3-comment load, cursor-based pagination for the next 10), interactive star ratings, public blog card rating metrics, and a dedicated Admin Blog "Interact" sub-section for cross-post moderation, verified author replies, and non-destructive soft-delete visibility controls.

### Vertical Slices

- **Slice 8.1: Decoupled Comments Collection, Post Aggregates & Firestore Security Rules [COMPLETED]**
  - Decouple comments from `BlogPost` into an independent top-level `comments` collection (`comments/{commentId}`) to eliminate document bloat and respect Firestore's 1MB per-document limit.
  - Add denormalized aggregate fields to `BlogPost` (`blogs/{blogId}`):
    - `comment_count: number` (total visible comments)
    - `rating_average: number` (calculated floating average, e.g. `4.88`)
    - `rating_count: number` (total ratings submitted)
  - Implement an atomic write pipeline (using Firestore transactions or batched writes) that automatically recalculates and updates `comment_count`, `rating_count`, and `rating_average` on the parent blog document whenever a comment is submitted or its visibility status toggles:
    $$\text{new\_avg} = \frac{(\text{old\_avg} \times \text{old\_count}) + \text{new\_rating}}{\text{old\_count} + 1}$$
  - Define strict Firestore security rules in `firestore.rules`:
    - Public read restricted to `status == "visible"` (authenticated admin reads all).
    - Public create enforced with strict validation: `status == "visible"`, `rating >= 1 && rating <= 5`, `author_name` (1-50 chars), `content` (1-2000 chars), `admin_reply == null`.
    - Admin-only updates for replies and visibility toggles.
    - **Hard Delete Prevention**: `allow delete: if false;` strictly enforces the soft-delete policy at the database rule layer.

- **Slice 8.2: Public Blog Card Ratings & Article Header Metadata UI Updates [COMPLETED]**
  - Update `src/components/blog/BlogCard.jsx`:
    - Render brutalist rating pill (`★ 4.9 (18)`) and comment counter pill (`💬 12 comments`) alongside read time and category tags.
    - Style badges with high-contrast borders and theme-aware surface fills (`#18181b` in dark mode, `#e9f0ea` in subtle sage light mode).
    - Consume pre-aggregated `rating_average` and `comment_count` directly from `BlogPost`, resulting in **0 additional Firestore reads** during index browsing.
  - Update `src/components/home/LatestBlogTile.jsx` on the Bento homepage grid with matching rating & comment pills.
  - Update `src/pages/public/BlogPostPage.jsx` article header:
    - Enrich metadata row below H1 with author name, publication date, reading time badge, star review summary pill (`★ 4.9 · 18 reviews`), and comment count badge (`💬 12 comments`).
    - Configure comment badge as an accessible smooth-scroll anchor that scrolls to and focuses the 3rd Div Comment Box in the right sidebar.

- **Slice 8.3: Reader Three-Tier Right Sidebar & 3rd Div Expandable Comment Box Layout [COMPLETED]**
  - Refactor `<aside>` in `BlogPostPage.jsx` into a three-tier modular right sidebar with sticky positioning (`top-20`, clearing the fixed 64px navbar):
    - **Tier / Div 1**: `TableOfContents.jsx` with scroll-spy active state tracking and constrained internal scroll (`max-h-[30vh] overflow-y-auto`).
    - **Tier / Div 2**: Reading Progress & Actions bar (`ArticleActionsBar.jsx` with percentage tracker, share to X, copy link).
    - **Tier / Div 3**: Dedicated Expandable Comment Box (`CommentBox.jsx` and `CommentItem.jsx`).
  - Mobile & Tablet responsive breakdown: When viewport is `< lg`, the 3 sidebar containers wrap and stack naturally beneath the main article body.
  - Neo-Brutalist container styling: crisp `border-zinc-800` (dark) / `#1b2e23` (light), hard offset drop shadow (`shadow-brutal`), and expandable drawer state.

- **Slice 8.4: Progressive Loading & Cursor-Based Pagination Hook (`useComments.js`) [COMPLETED]**
  - Create `src/hooks/useComments.js`:
    - Expose `{ comments, loading, loadingMore, error, hasMore, loadMore, addComment, toggleCommentVisibility, reload }`.
    - **Initial Load (Tier 1)**: Query `collection(db, "comments")` with constraints `where("post_id", "==", postId)`, `where("status", "==", "visible")`, `orderBy("created_at", "desc")`, `limit(3)`.
    - Cache the last retrieved document snapshot as the pagination cursor (`lastDocRef`).
    - **Expand & Load More (Tier 2)**: `loadMore()` triggers cursor pagination using `startAfter(lastDocRef).limit(10)`.
    - Concatenate newly fetched comments onto existing list without re-fetching previous pages, with automatic ID deduplication.
    - Evaluate `hasMore` by comparing loaded count against `post.comment_count`.
    - Guarantees bounded bandwidth and client memory even on viral articles with thousands of comments.

- **Slice 8.5: Interactive Star Rating Selector & Review Submission Form [COMPLETED]**
  - Create `src/components/blog/RatingStars.jsx`:
    - Dual-mode star component: Display-only mode (renders fractional ratings with star icons) and Interactive mode (1 to 5 stars with hover previews and tactile selection).
    - Keyboard accessible with `aria-label` ratings.
  - Create `src/components/blog/CommentForm.jsx`:
    - Rating selector (1-5 stars, required).
    - Author display name input (required, max 50 chars).
    - Review text textarea (required, max 2000 chars) with dynamic character counter.
    - Tactile Neo-Brutalist submit button (`active:translate-x-[2px] active:translate-y-[2px]`).
    - Optimistic UI update: On successful submission, prepends the new review to the local comment list and increments counters immediately.
    - Toast feedback on submission success or validation error.

- **Slice 8.6: Admin Blog CMS "Interact" Sub-Section (`/admin/blogs/interact`) [COMPLETED]**
  - Add protected sub-route `/admin/blogs/interact` in `src/App.jsx`.
  - Add navigation tab `[ Interact ]` to the Admin Blog CMS navigation header in `AdminLayout.jsx` and `BlogsCMS.jsx`.
  - Create `src/pages/admin/BlogInteractCMS.jsx`:
    - Unified table listing comments across all blog articles in one central inbox.
    - Columns: Post Title pill (linking directly to the live post), Author, Rating (`★ 1-5`), Snippet excerpt, Timestamp, Status pill (`Visible` [Green] vs `Hidden` [Zinc/Red]), and Actions (`Reply`, `Hide/Unhide`).
    - Multi-filter toolbar:
      - Filter by Blog Post (dropdown of all published posts).
      - Filter by Status (`All`, `Visible`, `Hidden`).
      - Filter by Rating (`All`, `5 Stars`, `< 3 Stars`).
      - Search by author name or comment keyword.
    - Summary metrics bar: Total platform comments, visible count, hidden count, and average rating.

- **Slice 8.7: Inline Admin Author Replies & Soft-Delete Lifecycle Management**
  - **Inline Admin Reply**:
    - Clicking "Reply" on any comment row opens `AdminReplyModal.jsx`.
    - Textarea for author response.
    - Writes `admin_reply: { content, replied_at: serverTimestamp(), author: "Piyush Bhagwat" }` directly to the comment document.
    - In `CommentItem.jsx` (public reader view), render the official reply nested beneath the user comment with a `[ Verified Author ]` badge, accent border, and timestamp.
  - **Strict Soft-Delete Strategy**:
    - Clicking "Hide" toggles `status: 'hidden'` via Firestore `updateDoc`.
    - Atomically decrements `comment_count` and updates `rating_average` on the corresponding `blogs/{blogId}`.
    - Clicking "Unhide" toggles `status: 'visible'` and re-adds to post aggregates.
    - Hard deletion is permanently disabled (`allow delete: if false;` in Firestore rules).
    - Preserves comment ID stability, audit logs, and prevents broken reply threads.

### Target Files
```
src/
├── components/
│   ├── blog/
│   │   ├── CommentBox.jsx        # Right-rail expandable comment container (3 initial + 10 cursor)
│   │   ├── CommentItem.jsx       # Individual comment card with star rating & verified admin reply
│   │   ├── CommentForm.jsx       # Review submission form (star picker, name, content)
│   │   ├── RatingStars.jsx       # Reusable Neo-Brutalist star rating indicator & input
│   │   └── BlogCard.jsx          # Updated card with rating pill and comment counter
│   ├── home/
│   │   └── LatestBlogTile.jsx    # Updated Bento tile with rating and comment indicators
│   └── admin/
│       └── AdminReplyModal.jsx   # Dedicated modal for drafting official author responses
├── hooks/
│   └── useComments.js            # Cursor-based pagination hook (3 -> +10), submit & soft-delete
├── pages/
│   ├── admin/
│   │   └── BlogInteractCMS.jsx   # Cross-post moderation dashboard with filters & reply tools
│   └── public/
│       ├── BlogPostPage.jsx      # Updated 3-tier right sidebar (TOC, Actions, Comments)
│       └── BlogsPage.jsx         # Public blog list with rating & comment counts
├── layouts/
│   └── AdminLayout.jsx           # Updated admin sidebar/tabs with "Interact" link
├── App.jsx                       # Added /admin/blogs/interact protected route
└── firestore.rules               # Decoupled comments collection rules with soft-delete enforcement
```

### Acceptance & Verification
1. Comments collection is strictly decoupled from `BlogPost`; adding comments does not increase post document size or risk hitting the 1MB Firestore limit.
2. Initial blog post page load executes a constrained query fetching strictly 3 visible comments; expanding or clicking "Load More" cursor-fetches the next 10 items via `startAfter(lastDocRef)`.
3. Public blog cards on `/blogs` and homepage Bento tile display live average ratings (`★ 4.9`) and comment counts (`💬 12`) with zero additional queries to the `comments` collection.
4. Article reader metadata row displays review rating and comment counts with a smooth-scroll anchor focusing the 3rd Div Comment Box in the right sidebar.
5. The right sidebar on `/blogs/:slug` cleanly isolates 3 distinct vertical containers: Table of Contents (Div 1), Actions & Progress (Div 2), and the Expandable Comment Box (Div 3).
6. Admin Blog CMS features the "Interact" sub-section (`/admin/blogs/interact`), aggregating comments across all posts with multi-filtering (by post, status, rating).
7. Admins can author inline replies to comments, which render publicly with `[ Verified Author ]` badges and accent styling.
8. Soft delete functions properly: clicking "Hide" marks `status: 'hidden'` and recalculates post aggregates atomically, while Firestore security rules reject hard delete requests (`allow delete: if false;`).

---

## Daily Definition of Done (DoD) Checklist

For each day of the sprint, the slice is considered complete only when:
- [ ] All code runs locally without console errors or warnings (`npm run dev`).
- [ ] No hardcoded placeholder strings remain in newly built components.
- [ ] All media assets link to Cloudinary CDN URLs rather than local bundle files.
- [ ] Responsive design functions across mobile (375px), tablet (768px), and desktop (1280px).
- [ ] TypeScript/PropTypes or defensive null-checks are in place for missing Firestore fields.
- [ ] Git commit created with a clear scope message (`feat(day-X): description`).
