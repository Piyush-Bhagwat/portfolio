# Portfolio V2 — Edge Cases & Corner Scenarios Reference

This document outlines all potential corner scenarios, failure modes, data anomalies, and boundary conditions across the 7-day implementation plan defined in [`V2/implimentation.md`](file:///home/piyush/Coding/Projects/portfolio/V2/implimentation.md). Every scenario is paired with concrete mitigation strategies and fail-safe implementations.

---

## 1. Quick Navigation Matrix

| Domain | High-Risk Edge Cases | Primary Mitigation Strategy |
| :--- | :--- | :--- |
| **Media & Cloudinary** | Oversized files, upload dropouts, orphaned images, broken URLs | Client-side validation, size caps, CDN transformation fallbacks, placeholder fallbacks |
| **Auth & Security** | Token expiry mid-edit, unsaved draft loss, XSS in Markdown | `localStorage` draft backup, token refresh listener, strict sanitizer (`rehype-sanitize`) |
| **Database & Firestore** | Empty collections, missing fields, schema drifts, quota limits | Defensive default props, schema validation, cached queries, batch migrations |
| **Blog & Editor** | Duplicate slugs, unclosed markdown tags, heavy lag on live preview | Debounced rendering, slug collision auto-increment, memoized syntax highlighter |
| **Bento UI & Layout** | Text overflow, broken aspect ratios, shadow clipping, 320px mobile | CSS `break-words`, `object-fit: cover`, `overflow-clip`, responsive grid breakpoints |
| **Migration** | Broken local asset paths, incomplete legacy objects | Migration dry-run script, fallback default objects |

---

## 2. Cloudinary & Media Pipeline Edge Cases

### 2.1 File Size & Type Violations
- **Scenario**: An admin accidentally attempts to upload a 50MB raw PNG, a TIFF file, a PDF, or an executable disguised as an image.
- **Risk**: Cloudinary API rejection (free tier maximum payload limit exceeded), wasted bandwidth, unhandled UI error.
- **Mitigation**:
  - Implement client-side file inspection before initiating HTTP POST:
    ```javascript
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, WEBP, or GIF.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    ```

### 2.2 Network Interruption During Upload
- **Scenario**: Mobile hotspot drops or Wi-Fi reconnects midway through uploading a 4MB project banner.
- **Risk**: Indefinite loading spinner, hanging promise, unhandled crash.
- **Mitigation**:
  - Attach an `AbortController` with a 30-second timeout to the `fetch` request in `src/services/cloudinary.js`.
  - Provide a retry button in the UI:
    ```javascript
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    // On catch: if (err.name === 'AbortError') toast.error("Upload timed out. Check connection.");
    ```

### 2.3 Orphaned Images in Cloudinary
- **Scenario**: An admin uploads 3 images into the Blog Editor, deletes 2 of them before hitting "Publish", or uploads a banner and closes the tab without saving.
- **Risk**: Cloudinary storage fills up with abandoned images over time.
- **Mitigation**:
  - Use a dedicated staging folder (`portfolio/temp/`) or accept that for a portfolio's low volume, free tier limits (25GB storage/credits) will easily accommodate tens of thousands of images.
  - On project/post deletion, store `image_public_id` and provide an optional admin cleanup utility or trigger Cloudinary deletion if an authenticated backend/Cloud Function exists.

### 2.4 Broken Asset URLs & 404s
- **Scenario**: A project's external image link expires or Cloudinary encounters an outage.
- **Risk**: Ugly broken image icon destroying the neo-brutalist bento tile.
- **Mitigation**:
  - Create a reusable `SmartImage` component with an `onError` fallback to an SVG terminal placeholder:
    ```jsx
    <img
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/assets/placeholders/terminal-placeholder.png";
      }}
      loading="lazy"
    />
    ```

---

## 3. Authentication, Session & Security Edge Cases

### 3.1 Token Expiration During Long Blog Writing Sessions
- **Scenario**: The admin spends 90 minutes writing a comprehensive technical case study. The Firebase Auth token expires or session invalidates. Upon clicking "Save Post", the Firestore write is rejected.
- **Risk**: Catastrophic loss of the written article!
- **Mitigation**:
  - **Auto-Save Drafts to `localStorage`**: The Blog Editor writes to `localStorage.getItem('draft_blog_' + id)` every 15 seconds.
  - On reload or auth failure, display: *"An unsaved local draft was found. [Restore Draft]"*.
  - Wrap Firestore writes in an auth refresh check: `await auth.currentUser?.getIdToken(true)` prior to submission.

### 3.2 Unsaved Changes Navigation Interception
- **Scenario**: Admin types halfway through editing their Bio or a Project and accidentally clicks an external link or browser back button.
- **Risk**: Form state wiped clean.
- **Mitigation**:
  - Implement a `usePrompt` or `beforeunload` listener in the form component:
    ```javascript
    useEffect(() => {
      const handleBeforeUnload = (e) => {
        if (isDirty) {
          e.preventDefault();
          e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);
    ```

### 3.3 Malicious Code & XSS in Markdown
- **Scenario**: Markdown content contains `<script>alert(1)</script>`, `<iframe src="malicious-site">`, or `<a href="javascript:doEvil()">`.
- **Risk**: Stored Cross-Site Scripting (XSS) executing in visitors' browsers.
- **Mitigation**:
  - Never use raw `dangerouslySetInnerHTML`.
  - Use `react-markdown` strictly configured with `rehype-sanitize`:
    ```jsx
    import ReactMarkdown from "react-markdown";
    import rehypeSanitize from "rehype-sanitize";
    import remarkGfm from "remark-gfm";

    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {content}
    </ReactMarkdown>
    ```

### 3.4 Unauthorized Direct Access to Admin Routes
- **Scenario**: An anonymous visitor tries navigating to `/admin/projects`, `/admin/blogs/new`, or `/manage`.
- **Risk**: Unauthorized UI exposure or data leakage.
- **Mitigation**:
  - `<ProtectedRoute />` intercepts before rendering any children:
    - If `loading`, show a full-screen terminal skeleton loader (`$ authenticating session...`).
    - If `!user || !isAdmin`, redirect with `<Navigate to="/admin/login" state={{ from: location }} replace />`.

---

## 4. Database & Firestore Operations Edge Cases

### 4.1 Empty Database / Cold Start (Day 1 - Day 3)
- **Scenario**: The app is booted before `site_config/profile`, `skills`, or `projects` are populated in Firestore.
- **Risk**: Uncaught `Cannot read properties of undefined (reading 'map')` crashing the entire React tree with a blank white screen.
- **Mitigation**:
  - Implement robust default states in `SiteDataContext`:
    ```javascript
    const defaultProfile = {
      name: "Piyush Bhagwat",
      role: "Full Stack Developer",
      bio_paragraphs: [],
      socials: [],
      status_badge: "Available for work"
    };
    ```
  - Defensive rendering across all components:
    ```jsx
    {projects?.length > 0 ? (
      projects.map(renderProject)
    ) : (
      <EmptyTerminalState message="No projects recorded yet. Run seed script in /admin." />
    )}
    ```

### 4.2 Incomplete or Missing Legacy Fields
- **Scenario**: A project migrated from legacy V1 has no `case_study` field, or has `problems` as `undefined` instead of `[]`.
- **Risk**: Opening the Case Study modal crashes when accessing `project.case_study.problems.map()`.
- **Mitigation**:
  - Always use optional chaining and nullish coalescing:
    ```jsx
    const challenges = project?.case_study?.challenges ?? project?.case_study?.problems ?? [];
    ```

### 4.3 Quota Protection / Infinite Re-render Fetch Loops
- **Scenario**: A component calls `fetchProjects()` inside a `useEffect` without a proper dependency array (`[fetchProjects]`), creating an infinite loop that exhausts Firestore's free tier (50,000 reads/day) in 20 minutes.
- **Risk**: Immediate Firestore quota shutdown, disabling the portfolio.
- **Mitigation**:
  - Centralize reads in `SiteDataContext`. Fetch once on application mount and cache in React state.
  - Never fetch raw Firestore queries directly inside leaf UI cards.
  - Use `sessionStorage` or a 5-minute memory cache to prevent re-fetching on rapid route changes.

---

## 5. Blog & Markdown Engine Edge Cases

### 5.1 Slug Duplication Collision
- **Scenario**: Admin publishes a blog titled *"Building a Modern Web App"*, generating slug `building-a-modern-web-app`. A year later, they write another article with the exact same title.
- **Risk**: Firestore query `where("slug", "==", slug)` returns 2 documents; navigation becomes non-deterministic or breaks.
- **Mitigation**:
  - Slug validation helper: On saving, check if another document already owns the slug:
    ```javascript
    const checkSlugCollision = async (slug, currentPostId) => {
      const q = query(collection(db, "blogs"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      const isDuplicate = snapshot.docs.some(doc => doc.id !== currentPostId);
      if (isDuplicate) {
        return `${slug}-${Date.now().toString().slice(-4)}`; // Auto-append timestamp suffix
      }
      return slug;
    };
    ```

### 5.2 Heavy Markdown Payloads (10,000+ Words)
- **Scenario**: A deep tutorial contains 50 code snippets and 15,000 words. Typing causes keystroke lag in the split-screen preview.
- **Risk**: Unusable editor typing experience.
- **Mitigation**:
  - Debounce the markdown preview rendering by 250ms using `useDeferredValue` or `useDebounce`:
    ```jsx
    const [rawMarkdown, setRawMarkdown] = useState("");
    const deferredMarkdown = useDeferredValue(rawMarkdown); // Non-blocking preview render
    ```

### 5.3 Code Blocks with Unknown/Unsupported Languages
- **Scenario**: Post includes ```` ```solidity ```` or ```` ```zig ```` which isn't registered in the standard Prism/Highlight theme.
- **Risk**: Syntax highlighter throws a runtime error and fails to render the page.
- **Mitigation**:
  - Fallback cleanly to plain text code rendering if the language parser is missing:
    ```jsx
    const CodeBlock = ({ inline, className, children }) => {
      const match = /language-(\w+)/.exec(className || "");
      try {
        return match ? <Highlight language={match[1]}>{children}</Highlight> : <code>{children}</code>;
      } catch (err) {
        return <pre className="bg-zinc-950 p-4 font-mono text-sm">{children}</pre>;
      }
    };
    ```

### 5.4 Reading Time on Blank or Non-Standard Posts
- **Scenario**: Post has no words (only an embedded image or video), or words are separated by non-standard unicode spaces.
- **Risk**: Read-time displays `0 min read` or `NaN min read`.
- **Mitigation**:
  - Enforce `Math.max(1, Math.ceil(words / 200))` so every post displays at least `1 min read`.

---

## 6. UI, Bento-Grid & Neo-Brutalist Layout Edge Cases

### 6.1 Extremely Long Strings / Unbroken URLs
- **Scenario**: A user puts `https://github.com/piyush-bhagwat/extremely-long-repository-name-that-does-not-contain-any-hyphens-or-spaces` in the card description.
- **Risk**: The text overflows the Bento card boundary, blowing out the horizontal viewport and creating horizontal scrollbars.
- **Mitigation**:
  - Apply `break-words break-all [overflow-wrap:anywhere]` across all card containers and typography wrappers.

### 6.2 Neo-Brutalist Hard Shadow Viewport Clipping
- **Scenario**: A card or button near the right or bottom edge has `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`.
- **Risk**: The 4px offset extends beyond the container width, causing subtle 4px horizontal scrolling on mobile.
- **Mitigation**:
  - Wrap the main application container in `overflow-x-hidden`.
  - Add `p-1` or `m-[2px]` breathing room around interactive brutalist components.

### 6.3 Bento-Grid Responsiveness Breakdown (320px vs 4K)
- **Scenario**: A complex 4-column Bento grid with `col-span-2 row-span-2` is opened on a 320px screen (iPhone SE) or a 3440px Ultrawide monitor.
- **Risk**: Grid squashes cards into unreadable slivers on mobile, or leaves massive empty gaps on ultrawide monitors.
- **Mitigation**:
  - Strictly progressive grid layout:
    ```html
    <!-- Mobile: 1 column | Tablet: 2 columns | Desktop: 4 columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
    ```
  - Constrain maximum width to `max-w-7xl` with auto margins so it stays centered and visually proportional on large monitors.

### 6.4 Non-Standard Image Aspect Ratios
- **Scenario**: A project cover photo is uploaded as a 9:16 vertical smartphone screenshot, while the card design expects a 16:9 banner.
- **Risk**: The image distorts, stretches, or expands the card height unevenly compared to neighbor tiles.
- **Mitigation**:
  - Enforce fixed aspect ratio containers with `object-cover`:
    ```jsx
    <div className="aspect-video w-full overflow-hidden border-b border-zinc-800 bg-zinc-950">
      <img src={url} alt={title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
    </div>
    ```

---

## 7. Migration & Backward Compatibility Edge Cases

### 7.1 Existing In-Flight Links
- **Scenario**: External resumes or recruiters have bookmarked `/#about` or `/projects` or `/manage`.
- **Risk**: Breaking navigation bookmarks or 404ing on legacy routes.
- **Mitigation**:
  - Provide route aliases and redirects:
    ```jsx
    <Route path="/manage" element={<Navigate to="/admin" replace />} />
    ```
  - Retain anchor link IDs (`id="about"`, `id="projects"`) on the new Bento homepage.

### 7.2 Mixed Local Assets vs. Cloudinary URLs
- **Scenario**: During Day 3–4, some projects still reference local imported images (`import lodiaHallImg from "./assets/..."`) while newly created projects reference Cloudinary URLs.
- **Risk**: Migration scripts fail on non-string image references.
- **Mitigation**:
  - Seed script normalizes legacy image references by uploading bundled assets to Cloudinary once or providing hosted fallback image URLs.

---

## 8. Defect Prevention Checklist (For Daily Pull Requests / Slices)

Before completing any daily vertical slice, verify:
- [ ] **No Unhandled Promises**: Every `async/await` has a `try/catch` and user-facing toast alert on failure.
- [ ] **Zero-Data State Test**: Does the page render gracefully if Firestore returns an empty collection `[]`?
- [ ] **Offline / Timeout Test**: What happens if the network drops during an operation?
- [ ] **Mobile Touch Test**: Are brutalist buttons and touch targets at least 44px by 44px on mobile?
- [ ] **Sanitization Check**: Is all user-generated content (markdown, URLs, tags) sanitized before rendering?
