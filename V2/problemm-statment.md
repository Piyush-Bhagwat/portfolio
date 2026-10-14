# Portfolio V2 — Problem Statement & Requirements Specification

## 1. Executive Summary

The current portfolio website (V1) is built using React (Vite) and Firebase. While functional as an initial portfolio, it has reached technical and architectural limitations:
1. **Asset Storage Dependency**: Uses Firebase Storage for media assets, which no longer offers a viable zero-cost tier for portfolio hosting.
2. **Limited & Static Content Management**: Most content (bio, skills, experiences, case studies) is hardcoded in frontend source files (`Home.page.jsx`, `projects.js`), while the admin dashboard (`Dashboard.jsx`) only provides a barebones and incomplete project creation form.
3. **Absence of a Content/Blogging Engine**: There is no platform for long-form technical writing, case breakdowns, or engineering articles.
4. **Outdated Visual Identity**: The current design lacks a modern, distinct programmer identity. It needs to transition to a high-contrast, bento-grid, neo-brutalist / minimal programmer aesthetic.

This document outlines the problem statement, gap analysis, requirements, technical architecture, and migration roadmap for **Portfolio V2**.

---

## 2. Gap Analysis: Current State (V1) vs. Desired State (V2)

| Dimension | Current State (V1) | Target State (V2) |
| :--- | :--- | :--- |
| **Media Storage** | Firebase Storage (paid/restricted tier) | Cloudinary (free tier, optimized CDN, automatic transformations) |
| **Site Content** | Hardcoded JSX strings & static arrays (`src/projects.js`) | Dynamic Firestore CMS; all text, media, socials, skills, and bio editable |
| **Admin Capabilities** | Incomplete single project form; no auth protection; no edit/delete flow | Secure Admin Suite: Profile Editor, Project & Case Study CRUD, Media Uploader, Blog CMS |
| **Writing & Articles** | None | Multi-view Blog System: Card Grid, Markdown Reader, Split-view Editor & Manager |
| **Visual Design** | Basic CSS layout, standard card grid | Modern Developer Bento-Grid, Neo-Brutalist touches, monospace typography, terminal motifs |
| **Developer Experience** | Vanilla CSS files (`main.style.css`, `mobile.style.css`), unmodularized | Modern component-driven styling (Tailwind CSS or modular styling), strict design tokens |

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

### Pillar 4: Visual & UX Transformation (Minimal, Programmer, Bento-Grid, Brutalist)
#### Problem:
- The current aesthetic does not communicate high engineering craft. It uses generic color schemes and floating CSS symbols that feel cluttered.
#### Design Direction:
- **Bento Grid Architecture**:
  - Information-dense, modular grid blocks with varying aspect ratios (1x1, 2x1, 2x2) that organize bio, latest commits/projects, current tech stack, and interactive badges into a coherent dashboard.
- **Neo-Brutalist & Programmer Identity**:
  - High-contrast borders (`1px` or `2px` crisp border with `#27272a` / `#e4e4e7` or stark borders).
  - Monospace typography accents (code snippets, timestamps, tags, micro-labels in `JetBrains Mono` / `Geist Mono` / `Fira Code`).
  - Terminal-inspired UI elements: Command-line style prompt (`$ whoami`, `cat about.txt`), live status pill (`● Available for opportunities`), subtle grid/dot pattern background.
  - Brutalist tactile elements: Sharp box shadows or crisp borders, flat buttons with subtle tactile press effects, high accessibility contrast.
  - Clean Dark Mode first palette with customizable accent color (e.g., emerald green, electric amber, or stark monochrome).

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
- **Styling & UI**: Tailwind CSS (recommended for fast bento-grid layouts & neo-brutalist styling) + Lucide React / React Icons.
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
   - Install styling tools (Tailwind CSS, typography plugin) and configure design tokens (fonts, borders, brutalist shadows).

2. **Phase 2: Admin CMS Development**
   - Profile & About editor.
   - Skills & Experience timeline manager.
   - Project & Case Study full CRUD editor with Cloudinary image uploader.

3. **Phase 3: Blog System Development**
   - Admin Blog Editor (Markdown split view with live preview).
   - Admin Blog List Manager (draft/publish toggle, delete).
   - Public Blog Index (`/blogs`) with bento-style card grid and tag search.
   - Public Blog Post View (`/blogs/:slug`) with markdown rendering and code highlight.

4. **Phase 4: Public Redesign (Bento + Brutalist UI)**
   - Bento-grid homepage (`/`): Terminal hero, interactive skills tile, featured projects tile, latest blog post tile, contact dock.
   - Revamped `/projects` listing and individual Case Study modals/pages.
   - Responsive polish, performance optimization, and lighthouse audit.
