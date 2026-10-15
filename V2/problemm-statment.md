# Portfolio V2 — Problem Statement & Requirements Specification

## 1. Executive Summary

The current portfolio website (V1) is built using React (Vite) and Firebase. While functional as an initial portfolio, it has reached technical and architectural limitations:
1. **Asset Storage Dependency**: Uses Firebase Storage for media assets, which no longer offers a viable zero-cost tier for portfolio hosting.
2. **Limited & Static Content Management**: Most content (bio, skills, experiences, case studies) is hardcoded in frontend source files (`Home.page.jsx`, `projects.js`), while the admin dashboard (`Dashboard.jsx`) only provides a barebones and incomplete project creation form.
3. **Absence of a Content/Blogging Engine**: There is no platform for long-form technical writing, case breakdowns, or engineering articles.
4. **Outdated Visual Identity & Single Theme**: The current design lacks a modern, distinct programmer identity and lacks theme flexibility. It needs to transition to a high-contrast, bento-grid, neo-brutalist / minimal programmer aesthetic with a **first-class dual theme system** (sleek dark mode and an organic, subtle greenish light mode with seamless toggling).

This document outlines the problem statement, gap analysis, requirements, technical architecture, and migration roadmap for **Portfolio V2**.

---

## 2. Gap Analysis: Current State (V1) vs. Desired State (V2)

| Dimension | Current State (V1) | Target State (V2) |
| :--- | :--- | :--- |
| **Media Storage** | Firebase Storage (paid/restricted tier) | Cloudinary (free tier, optimized CDN, automatic transformations) |
| **Site Content** | Hardcoded JSX strings & static arrays (`src/projects.js`) | Dynamic Firestore CMS; all text, media, socials, skills, and bio editable |
| **Admin Capabilities** | Incomplete single project form; no auth protection; no edit/delete flow | Secure Admin Suite: Profile Editor, Project & Case Study CRUD, Media Uploader, Blog CMS |
| **Writing & Articles** | None | Multi-view Blog System: Card Grid, Markdown Reader, Split-view Editor & Manager |
| **Visual Design & Themes** | Basic CSS layout, standard card grid, dark-only styling | Modern Developer Bento-Grid, Neo-Brutalist touches, monospace typography, terminal motifs, and **Dual Theme System (High-contrast Dark Mode + Subtle Greenish Light Theme with 1-click persistent toggle)** |
| **Developer Experience** | Vanilla CSS files (`main.style.css`, `mobile.style.css`), unmodularized | Modern component-driven styling (Tailwind CSS `darkMode: 'class'`), semantic CSS custom property tokens, reusable theme hooks |

---

## 3. Core Pillars & Problem Statements

### Pillar 1: Storage Migration (Firebase Storage → Cloudinary)
#### Problem:
- Firebase Storage requires billing setup and lacks built-in on-the-fly image optimization, responsive resizing, and format delivery (WebP/AVIF) on the free tier.
#### Requirements:
- Migrate all current and future image uploads (profile avatars, project banners, case study diagrams, blog covers) to **Cloudinary**.
- Implement a reusable client-side upload handler (via unsigned Cloudinary upload presets or authenticated API backend) with drag-and-drop support.
- Store Cloudinary `public_id`, `secure_url`, and thumbnail transformations in Firestore records.
- Replace existing local bundled images (`src/images/*`) with CDN-served assets.

---

### Pillar 2: Dynamic Admin & Content Management Suite
#### Problem:
- Currently, updating a skill, changing the about text, editing work experience, or updating project details requires code changes and redeployment.
- Case studies in `src/projects.js` contain detailed structured fields (`why`, `learning`, `tech`, `problems: [{que, ans}]`), but there is no interface to edit, add, or delete them.
- The route `/manage` is unprotected, allowing arbitrary modification if exposed.
#### Requirements:
- **Authentication & Security**:
  - Secure `/admin` or `/manage` using Firebase Authentication (Email/Password or GitHub OAuth restricted to the owner's UID).
- **Profile & Bio Management**:
  - Full CRUD over personal details: Full Name, Tagline/Hero heading, Bio paragraphs, Profile photo (Cloudinary), Social links (GitHub, LinkedIn, X, Instagram, etc.), Resume URL/file.
- **Skills Management**:
  - Add, edit, reorder, and remove skills with custom icons/images and category groupings (Frontend, Backend, Databases, Tools).
- **Experience & Milestones**:
  - Timeline management: Role, Company/Org, Duration, Description, Key Contributions.
- **Projects & Case Studies CRUD**:
  - Create and edit projects with: Title, Description, Live URL, Repository URL, Tech stack tags, Date, Cover image (Cloudinary), Featured flag.
  - Deep Case Study Editor: Motivation/Problem statement, Architecture decisions, Key learnings, Challenges & Solutions (`Q&A` format), API references.

---

### Pillar 3: Technical Blogging Platform
#### Problem:
- A modern programmer's portfolio must showcase deep technical understanding through long-form articles, tutorials, and post-mortems. Currently, no blogging capability exists.
#### Requirements:
The blog system requires four core views:
1. **Blogs Homepage / Explorer (`/blogs`)**:
   - Bento/card grid layout displaying article cards.
   - Metadata: Title, short excerpt, cover banner, read time estimate (calculated from word count), publication date, tags.
   - Filter by tag and real-time search input.
2. **Blog Reader / Article View (`/blogs/:slug`)**:
   - Clean, distraction-free reading typography.
   - Rich Markdown parsing (supporting GitHub Flavored Markdown, inline code, syntax-highlighted code blocks with language badges and copy-to-clipboard button).
   - Table of contents (sticky sidebar or top drawer).
   - Social sharing and back-to-all-posts navigation.
3. **Blog Editor (`/admin/blogs/editor` & `/admin/blogs/editor/:id`)**:
   - Interactive split-pane Markdown editor with real-time live preview.
   - Article metadata controls: Slug generator, custom tags, publication status (Draft vs. Published), cover image uploader.
   - Drag-and-drop image insertion into markdown body uploading directly to Cloudinary.
4. **Blog Management Dashboard (`/admin/blogs`)**:
   - Table/List view showing all posts with status indicators (`DRAFT` / `PUBLISHED`), creation/update dates, quick preview, edit, and delete actions.

---

### Pillar 4: Visual & UX Transformation (Minimal, Programmer, Bento-Grid, Brutalist & Dual Themes)
#### Problem:
- The current aesthetic does not communicate high engineering craft. It uses generic color schemes and floating CSS symbols that feel cluttered.
- Furthermore, the site lacks theme versatility: single-theme implementations fail to accommodate user environmental preferences, while conventional light themes often suffer from glaring pure-white canvases that destroy developer atmosphere and induce ocular fatigue.

#### Design Direction & Dual-Theme Architecture:
- **Bento Grid Architecture**:
  - Information-dense, modular grid blocks with varying aspect ratios (1x1, 2x1, 2x2) that organize bio, latest commits/projects, current tech stack, and interactive badges into a coherent dashboard.
- **Neo-Brutalist & Programmer Identity**:
  - High-contrast borders (`1px` or `2px` crisp border with `#27272a` in dark mode or deep evergreen-charcoal `#1b2e23` in light mode).
  - Monospace typography accents (code snippets, timestamps, tags, micro-labels in `JetBrains Mono` / `Geist Mono` / `Fira Code`).
  - Terminal-inspired UI elements: Command-line style prompt (`$ whoami`, `cat about.txt`), live status pill (`● Available for opportunities`), subtle grid/dot pattern background.
  - Brutalist tactile elements: Sharp box shadows or crisp borders, flat buttons with subtle tactile press effects, high accessibility contrast.

#### Color Theory & Subtle Greenish Light Theme:
- **Rationale & Philosophy**:
  - Rather than sterile, blinding `#ffffff` backgrounds, the light theme adopts an organic, refined **Subtle Greenish Palette** rooted in Japanese celadon, sage, and mint hues.
  - This preserves the hacker/terminal identity in daylight, eliminates eye strain, and provides visual warmth while preserving sharp neo-brutalist contrast.
- **Light Theme Color Palette Breakdown**:
  - **Canvas Background (Base)**: `#f4f7f4` (Light Sage / Pale Celadon) — high lightness (>96%), very low saturation (~4%), soft on eyes.
  - **Elevated Card Surface**: `#ffffff` (Crisp Pure Bone White) — creates clean depth separation against the sage canvas.
  - **Secondary / Hover Surface**: `#e9f0ea` (Muted Laurel / Soft Mint) — used for nested tiles, filter chips, and hover states.
  - **Borders & Dividers**: `#1b2e23` (Deep Evergreen Charcoal, `1px`/`2px`) for high-contrast brutalist outlines; `#cbdad0` (Muted Sage Gray) for subtle interior rules.
  - **Text Primary**: `#0f1a14` (Deep Forest Charcoal) — achieves an ultra-crisp **15.2:1** contrast ratio against `#f4f7f4`, easily satisfying WCAG AAA standards.
  - **Text Muted / Secondary**: `#4b5e53` (Slate Pine) — achieves a **5.1:1** contrast ratio, exceeding WCAG AA requirements for body text.
  - **Interactive Accent**: `#059669` (Emerald-600) / `#047857` (Emerald-700) — calibrating the dark theme's `#10b981` to a deeper green for optimal AAA contrast (>4.6:1) on light surfaces.
  - **Secondary Accent**: `#0891b2` (Cyan-600) / `#0e7490` (Cyan-700) — terminal cyan tuned for daylight readability.
  - **Brutalist Shadows (Light Mode)**: `#1b2e23` hard offset shadows (`4px 4px 0px 0px #1b2e23`) retaining tactile physical press-down effects.
  - **Background Grid**: `radial-gradient(rgba(27, 46, 35, 0.10) 1px, transparent 1px)` providing an architectural blueprint vibe.

#### Dual Theme Engine & Seamless Toggling:
- **Zero-FOUC Initialization**: Synchronous theme resolution before React hydration to prevent flash-of-wrong-theme.
- **Persistence & Synchronization**: Store user preference in `localStorage` (`'portfolio-theme': 'dark' | 'light' | 'system'`), auto-syncing with OS system changes (`prefers-color-scheme`).
- **Interactive Switch**: Neo-brutalist ThemeToggle component placed in public navbar and admin top-bar with smooth iconography rotation and tactile response.

---

## 4. Proposed Database Schema (Firestore)

```
portfolio/
├── site_config/
│   └── profile/
│       ├── name: string
│       ├── role: string
│       ├── tagline: string
│       ├── bio: string[]
│       ├── avatar_url: string
│       ├── socials: { name, url, icon }[]
│       └── resume_url: string
│
├── skills/
│   └── {skill_id}/
│       ├── name: string
│       ├── category: "frontend" | "backend" | "devops" | "tools"
│       ├── icon_url: string
│       └── order: number
│
├── experiences/
│   └── {experience_id}/
│       ├── role: string
│       ├── company: string
│       ├── period: string
│       ├── description: string
│       └── order: number
│
├── projects/
│   └── {project_id}/
│       ├── title: string
│       ├── slug: string
│       ├── description: string
│       ├── tags: string[]
│       ├── live_url: string
│       ├── github_url: string
│       ├── image_url: string
│       ├── featured: boolean
│       ├── date: string
│       └── case_study: {
│             why: string,
│             tech_stack: string[],
│             learnings: string[],
│             problems: { que: string, ans: string }[]
│           }
│
└── blogs/
    └── {blog_id}/
        ├── title: string
        ├── slug: string
        ├── excerpt: string
        ├── content_markdown: string
        ├── cover_image_url: string
        ├── tags: string[]
        ├── read_time_minutes: number
        ├── published: boolean
        ├── created_at: timestamp
        └── updated_at: timestamp
```

---

## 5. Technical Stack Recommendations for V2

- **Frontend Core**: React 18 / 19 + Vite (remains lightweight and blazing fast).
- **Styling & UI**: Tailwind CSS (with `darkMode: 'class'`), semantic CSS custom property tokens for instant theme switching, Lucide React icons.
- **Theming & State**: Dedicated `ThemeContext` + `useTheme` hook with `localStorage` persistence, OS system preference synchronization (`prefers-color-scheme`), and zero-FOUC initialization script.
- **Typography**: Inter / Geist for body text; JetBrains Mono / Geist Mono for programmer accents.
- **Database & Auth**: Firebase Firestore (data) + Firebase Authentication (admin protection).
- **Asset Storage & CDN**: Cloudinary (Image uploads, auto-format WebP, responsive resizing).
- **Markdown Processing**: `react-markdown` + `remark-gfm` + `rehype-highlight` / `prismjs` for code syntax highlighting.
- **Animations**: `framer-motion` for subtle micro-interactions and smooth layout transitions.

---

## 6. Implementation Milestones

1. **Phase 1: Architecture & Foundation**
   - Setup Cloudinary service utility & upload handlers.
   - Establish Firebase Authentication for admin access protection.
   - Install styling tools (Tailwind CSS, typography plugin) and configure design tokens (fonts, borders, brutalist shadows, dark/light color variables).
   - Implement `ThemeContext`, `ThemeToggle` component, and dark/light mode class binding.

2. **Phase 2: Admin CMS Development**
   - Profile & About editor.
   - Skills & Experience timeline manager.
   - Project & Case Study full CRUD editor with Cloudinary image uploader.

3. **Phase 3: Blog System Development**
   - Admin Blog Editor (Markdown split view with live preview).
   - Admin Blog List Manager (draft/publish toggle, delete).
   - Public Blog Index (`/blogs`) with bento-style card grid and tag search.
   - Public Blog Post View (`/blogs/:slug`) with markdown rendering and code highlight.

4. **Phase 4: Public Redesign & Dual-Theme Experience (Bento + Brutalist UI)**
   - Bento-grid homepage (`/`): Terminal hero, interactive skills tile, featured projects tile, latest blog post tile, contact dock.
   - Revamped `/projects` listing and individual Case Study modals/pages.
   - Cross-theme visual verification: ensure full WCAG contrast and brutalist polish across both Dark mode and the subtle greenish Light mode.
   - Responsive polish, performance optimization, and lighthouse audit.
