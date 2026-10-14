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
Build the complete authoring and management environment for technical articles, featuring a split-screen Markdown editor with live preview and integrated Cloudinary image ingestion.

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

## Daily Definition of Done (DoD) Checklist

For each day of the sprint, the slice is considered complete only when:
- [ ] All code runs locally without console errors or warnings (`npm run dev`).
- [ ] No hardcoded placeholder strings remain in newly built components.
- [ ] All media assets link to Cloudinary CDN URLs rather than local bundle files.
- [ ] Responsive design functions across mobile (375px), tablet (768px), and desktop (1280px).
- [ ] TypeScript/PropTypes or defensive null-checks are in place for missing Firestore fields.
- [ ] Git commit created with a clear scope message (`feat(day-X): description`).
