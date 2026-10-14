# Portfolio V2 — Project Context & Session History

This document serves as the persistent memory and operational context for the **Portfolio V2** redesign and modernization sprint. It details the project architecture, progress to date, active design tokens, secrets configuration, and next priorities for subsequent coding sessions.

---

## 1. Project High-Level Overview

- **Owner**: Piyush Bhagwat (`piyushbhagwat5@gmail.com`)
- **Core Stack**: React 18 (Vite SPA), Tailwind CSS, Framer Motion, Firebase (Auth + Firestore), Cloudinary (Media Pipeline).
- **Design Philosophy**: Minimalist Bento-Grid + Neo-Brutalist developer aesthetic:
  - Deep dark theme base (`#09090b` / Zinc-950) with elevated card surfaces (`#121215`).
  - Crisp `1px`/`2px` high-contrast solid borders (`border-zinc-800`, `border-zinc-700`).
  - Tactile offset drop shadows (`4px 4px 0px 0px rgba(0,0,0,1)`).
  - Programmer typography: `Inter` for body copy, `JetBrains Mono` for tags, metrics, and terminal headers.
  - Accent colors: `terminal-green` (`#10b981`), `terminal-cyan` (`#06b6d4`).

---

## 2. 7-Day Sprint Roadmap & Current Status

| Day | Focus / Vertical Slice | Status | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Day 1** | **Foundations, Design Tokens & Cloudinary** | **COMPLETED** | Tailwind setup, brutalist primitives, Cloudinary service & uploader |
| **Day 2** | Auth, Session Guard & Admin Shell | *NEXT UP* | Firebase Auth, protected routes, `AdminLayout`, `/admin/login` |
| **Day 3** | Profile, Skills & Experience CMS | Pending | Dynamic Bio/Socials, Skills & Milestones CRUD, DB migration seeder |
| **Day 4** | Projects & Case Studies Engine | Pending | Dynamic project CRUD, deep case study schema, live preview drawer |
| **Day 5** | Blog Engine: Editor & Media Pipeline | Pending | Split-pane markdown editor, drag-to-upload to Cloudinary, CMS table |
| **Day 6** | Public Blog Reader & Case Study Showcase | Pending | `/blogs` index, reader with TOC, syntax highlighting, drawer modal |
| **Day 7** | Bento-Grid Homepage, Polish & Cutover | Pending | Bento homepage redesign, micro-interactions, mobile polish, launch |

---

## 3. Work Completed in Day 1

### Slice 1.1: Styling Infrastructure & Tokens
- **Dependencies**: Installed `tailwindcss@^3.4.17`, `postcss`, `autoprefixer`, `@tailwindcss/typography`, and `lucide-react`.
- **Configuration**:
  - [`postcss.config.js`](file:///home/piyush/Coding/Projects/portfolio/postcss.config.js): Configured PostCSS with Tailwind and Autoprefixer.
  - [`tailwind.config.js`](file:///home/piyush/Coding/Projects/portfolio/tailwind.config.js): Configured fonts (`Inter`, `JetBrains Mono`), terminal colors (`terminal-green`, `terminal-cyan`, `terminal-bg`, `terminal-card`, `terminal-border`), brutalist shadows (`shadow-brutal`, `shadow-brutal-sm`, accent variants), and typography plugin.
  - [`index.html`](file:///home/piyush/Coding/Projects/portfolio/index.html): Injected Google Fonts preconnect and stylesheet links for `Inter` (300-800) and `JetBrains Mono` (300-700).
  - [`src/styles/brutalist.css`](file:///home/piyush/Coding/Projects/portfolio/src/styles/brutalist.css): Utility styles for dot grids (`bg-grid-dots`, `bg-grid-lines`), tactile button press states (`brutal-press`), and custom minimalist scrollbars.
  - [`src/styles/index.css`](file:///home/piyush/Coding/Projects/portfolio/src/styles/index.css): Base Tailwind directives and CSS variables.
  - [`src/main.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/main.jsx): Imported `src/styles/index.css`.

### Slice 1.2: Neo-Brutalist & Bento Primitives
All primitives are implemented with defensive props, accessible roles, and tactile feedback in `src/components/brutalist/`:
- [`BentoCard.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/BentoCard.jsx): Bento container with subtle dot pattern option, hover translation (`hover:-translate-x-[2px] hover:-translate-y-[2px]`), border styling, and header slots (`title`, `subtitle`, `badge`, `action`).
- [`BrutalButton.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/BrutalButton.jsx): High-contrast button with tactile click offset (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`), supporting variants (`primary`, `secondary`, `terminal`, `cyan`, `danger`, `outline`), sizes (`sm`, `md`, `lg`), icons, and link mode (`href`).
- [`TagBadge.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/TagBadge.jsx): Monospace tech tag pill with color variants, status dots, interactive click, and remove handler (`onRemove` for CMS).
- [`TerminalBox.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/TerminalBox.jsx): Developer window box with macOS/Linux window dots (red, amber, green), title bar, code body, and 1-click clipboard copy button with feedback.
- [`StatusPill.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/StatusPill.jsx): Monospace status badge with live animated pulsing radar dot (`available`, `busy`, `building`, `offline`).
- [`index.js`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/index.js): Barrel export for all primitives.

### Slice 1.3: Cloudinary Integration Layer
- [`src/services/cloudinary.js`](file:///home/piyush/Coding/Projects/portfolio/src/services/cloudinary.js):
  - **Client-Side Validation**: Pre-checks file type (`JPG`, `PNG`, `WEBP`, `GIF`, `SVG`) and caps file size at 5MB before any network transmission.
  - **Direct Unsigned Upload**: Uploads directly to Cloudinary using an unsigned preset; supports real-time upload progress tracking (`0–100%`), 30-second timeout, and `AbortController` cancellation.
  - **Dynamic URL Optimization**: Injects `f_auto,q_auto` and dimensional transforms (`c_fill,w_600,h_400`) into Cloudinary URLs while safely preserving external/local URLs.
  - **Defensive Environment Parsing**: Compatible with both client-side Vite (`import.meta.env`) and Node test/SSR environments (`process.env`).
- [`src/components/common/ImageUploader.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/common/ImageUploader.jsx):
  - Drag-and-drop upload zone with instant local object URL preview.
  - Animated progress bar during network upload.
  - Metadata pill tags (dimensions, format) and 1-click URL copy.
  - Error alert with inline retry button on connection failure or timeout.
- [`.env.example`](file:///home/piyush/Coding/Projects/portfolio/.env.example): Template for `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.

### Live Component Sandbox
- Created [`src/components/brutalist/BrutalistShowcase.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/components/brutalist/BrutalistShowcase.jsx) and mounted it to `/v2-preview` in [`src/App.jsx`](file:///home/piyush/Coding/Projects/portfolio/src/App.jsx).
- Accessible in development at `http://localhost:5173/v2-preview` or via **"⚡ V2 Primitives"** in the navbar.

---

## 4. Key Architecture & Security Decisions

1. **Unsigned Upload Preset Security**:
   - The Cloudinary API Secret is **intentionally excluded** from frontend code. Frontend SPAs cannot securely store secrets.
   - Cloudinary unsigned uploads enforce server-side validation rules (folder path, maximum 5MB, accepted mime types) via Cloudinary's backend preset (`portfolio_unsigned`).
2. **Coexistence with Legacy V1**:
   - Existing public routes (`/`, `/projects`, `/manage`) remain functional while V2 features are developed under new routes (`/v2-preview`, `/admin/*`, `/blogs/*`).
   - The final public homepage cutover occurs on Day 7.
3. **Defensive UI Principles**:
   - All text wrappers enforce `break-words [overflow-wrap:anywhere]` to prevent long strings/URLs from breaking containers.
   - Images inside containers use `object-cover` with SVG/placeholder fallbacks on `onError`.

---

## 5. Configuration & Environment Variables

Create a `.env` file in the project root with the following:

```bash
# Cloudinary Configuration (Unsigned upload)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned

# Firebase Configuration (Existing project: portfolio-c6f29)
VITE_FIREBASE_API_KEY=AIzaSyAzasoo8Y7Tt7V_n0Ct7yzR0d1APDyBJ9M
VITE_FIREBASE_AUTH_DOMAIN=portfolio-c6f29.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=portfolio-c6f29
VITE_FIREBASE_STORAGE_BUCKET=portfolio-c6f29.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=350726943938
VITE_FIREBASE_APP_ID=1:350726943938:web:6ab5e6de3177b611ce375b

# Admin Authorized Email
VITE_ADMIN_EMAIL=piyushbhagwat5@gmail.com
```

---

## 6. Target File Tree (Current & Planned)

```
portfolio/
├── .env.example                               # [Done]
├── tailwind.config.js                         # [Done]
├── postcss.config.js                          # [Done]
├── V2/
│   ├── architecture.md                        # Blueprint & component hierarchy
│   ├── context.md                             # [Done - This File] Session context
│   ├── edge-case.md                           # Edge-case & failure mode mitigations
│   ├── implimentation.md                      # 7-Day implementation schedule
│   └── problemm-statment.md                   # Problem statement & goals
└── src/
    ├── styles/
    │   ├── index.css                          # [Done] Base Tailwind & layer rules
    │   └── brutalist.css                      # [Done] Dot grids, button presses
    ├── services/
    │   ├── cloudinary.js                      # [Done] Unsigned upload & CDN optimizer
    │   ├── firebase.js                        # [Planned Day 2] Auth & Firestore instance
    │   └── markdown.js                        # [Planned Day 5] Parser & syntax rules
    ├── components/
    │   ├── brutalist/
    │   │   ├── BentoCard.jsx                  # [Done]
    │   │   ├── BrutalButton.jsx               # [Done]
    │   │   ├── TagBadge.jsx                   # [Done]
    │   │   ├── TerminalBox.jsx                # [Done]
    │   │   ├── StatusPill.jsx                 # [Done]
    │   │   ├── BrutalistShowcase.jsx          # [Done]
    │   │   └── index.js                       # [Done]
    │   ├── common/
    │   │   ├── ImageUploader.jsx              # [Done]
    │   │   ├── ProtectedRoute.jsx             # [Planned Day 2]
    │   │   └── index.js                       # [Done]
    │   ├── blog/                              # [Planned Day 5-6]
    │   └── project/                           # [Planned Day 4]
    ├── context/
    │   ├── AuthContext.jsx                    # [Planned Day 2]
    │   └── SiteDataContext.jsx                # [Planned Day 3]
    ├── layouts/
    │   ├── AdminLayout.jsx                    # [Planned Day 2]
    │   └── PublicLayout.jsx                   # [Planned Day 7]
    └── pages/
        ├── admin/
        │   ├── Login.jsx                      # [Planned Day 2]
        │   ├── Overview.jsx                   # [Planned Day 2]
        │   ├── ProfileCMS.jsx                 # [Planned Day 3]
        │   ├── ProjectsCMS.jsx                # [Planned Day 4]
        │   └── BlogEditor.jsx                 # [Planned Day 5]
        └── public/
            ├── Home.jsx                       # [Planned Day 7]
            ├── Projects.jsx                   # [Planned Day 4]
            └── Blogs.jsx                      # [Planned Day 6]
```

---

## 7. Immediate Next Step: Day 2 Execution Plan

When resuming work, proceed with **Day 2: Authentication, Security & Base Admin Shell**:
1. **Slice 2.1**: Refactor/modernize Firebase service in `src/services/firebase.js` with `getAuth(app)` and email/password login restricted to `piyushbhagwat5@gmail.com`.
2. **Slice 2.2**: Implement `src/context/AuthContext.jsx` and `src/components/common/ProtectedRoute.jsx`.
3. **Slice 2.3**: Build `src/layouts/AdminLayout.jsx` with responsive sidebar navigation and `/admin/login` page with brutalist terminal-box styling.
4. **Slice 2.4**: Create `firestore.rules` draft enforcing public read access and restricting write access to the admin email.
