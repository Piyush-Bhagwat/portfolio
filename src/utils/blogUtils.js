import { collection, query, where, getDocs } from "firebase/firestore";

export const DEFAULT_BLOG_MARKDOWN = `# Building Resilient Web Interfaces with Neo-Brutalism

A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens and modern accessibility standards.

## Architecture Overview

Modern web design often leans heavily on flat, homogenized components. Neo-Brutalism brings back bold boundaries, high-contrast borders, and tactile physical feedback.

### Key Tenets
1. **High Contrast**: Clean 2px solid borders with deliberate color blocking.
2. **Tactile Interaction**: Active translation transforms (\`translate-x-0.5 translate-y-0.5\`).
3. **Typography**: Monospace and system fonts that evoke classic terminal consoles.

\`\`\`javascript
// Example: Neo-Brutalist button primitive
export function BrutalButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-black bg-emerald-400 px-4 py-2 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
    >
      {children}
    </button>
  );
}
\`\`\`

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."

## Performance Benchmarks
| Framework | First Contentful Paint | Bundle Size |
| :--- | :--- | :--- |
| React + Vite | 0.4s | 42 KB |
| Legacy SPA | 1.8s | 340 KB |

---
*Published by Piyush Bhagwat*
`;

export const SUGGESTED_TAGS = [
  "React",
  "Architecture",
  "UI Engineering",
  "Design Systems",
  "Node.js",
  "Firebase",
  "Cloudinary",
  "Performance",
  "Web Dev",
];

/**
 * Utility to calculate reading time
 */
export function calculateReadTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Utility to generate URL slugs
 */
export function slugifyTitle(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Utility to check if a slug already belongs to another article in Firestore
 * @param {import("firebase/firestore").Firestore} database
 * @param {string} slug
 * @param {string} [currentPostId]
 * @returns {Promise<{ isDuplicate: boolean, suggestedSlug: string }>}
 */
export async function checkSlugCollision(database, slug, currentPostId) {
  if (!slug || !database) {
    return { isDuplicate: false, suggestedSlug: slug || "" };
  }
  try {
    const blogsRef = collection(database, "blogs");
    const q = query(blogsRef, where("slug", "==", slug));
    const snap = await getDocs(q);
    const duplicates = snap.docs ? snap.docs.filter((d) => d.id !== currentPostId) : [];
    if (duplicates.length > 0) {
      const suggestedSlug = `${slug}-${Date.now().toString().slice(-4)}`;
      return { isDuplicate: true, suggestedSlug };
    }
    return { isDuplicate: false, suggestedSlug: slug };
  } catch (err) {
    console.error("Slug check error:", err);
    return { isDuplicate: false, suggestedSlug: slug };
  }
}

/**
 * Computes a unique, prioritized list of tag suggestions (up to maxCount, default 15).
 * - Prioritizes already used tags first (sorted by descending usage frequency).
 * - Follows with existing base suggestions (SUGGESTED_TAGS) that haven't been used yet.
 * - Deduplicates case-insensitively while preserving original casing.
 * - Excludes currently selected active tags.
 *
 * @param {Array<string | { tags?: string[] }>} [usedSources=[]] - Array of used tag strings or post objects
 * @param {string[]} [activeTags=[]] - Currently selected tags to exclude
 * @param {string[]} [baseSuggestions=SUGGESTED_TAGS] - Existing predefined suggestions
 * @param {number} [maxCount=15] - Maximum number of suggestions to return
 * @returns {string[]} Top prioritized unique suggestion tags
 */
export function getTopSuggestedTags(
  usedSources = [],
  activeTags = [],
  baseSuggestions = SUGGESTED_TAGS,
  maxCount = 15
) {
  const activeSet = new Set((activeTags || []).map((t) => String(t || "").trim().toLowerCase()));
  const frequencyMap = new Map(); // lowercase -> { count, original }

  // 1. Count frequencies from used sources (accepts list of tag strings or post objects)
  (usedSources || []).forEach((item) => {
    if (!item) return;
    const tagList = Array.isArray(item)
      ? item
      : Array.isArray(item.tags)
      ? item.tags
      : typeof item === "string"
      ? [item]
      : [];

    tagList.forEach((raw) => {
      const trimmed = String(raw || "").trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (!frequencyMap.has(lower)) {
        frequencyMap.set(lower, { count: 0, original: trimmed });
      }
      frequencyMap.get(lower).count += 1;
    });
  });

  // 2. Sort already used tags by descending frequency, then alphabetically
  const sortedUsed = Array.from(frequencyMap.entries())
    .sort((a, b) => {
      const countDiff = b[1].count - a[1].count;
      if (countDiff !== 0) return countDiff;
      return a[1].original.localeCompare(b[1].original);
    })
    .map((entry) => entry[1].original);

  const result = [];
  const seenLower = new Set();

  // 3. Add already used tags first (if not in active tags)
  for (const tag of sortedUsed) {
    const lower = tag.toLowerCase();
    if (!activeSet.has(lower) && !seenLower.has(lower)) {
      seenLower.add(lower);
      result.push(tag);
      if (result.length >= maxCount) return result;
    }
  }

  // 4. Follow with existing base suggestions not yet in the list
  for (const tag of baseSuggestions || []) {
    const trimmed = String(tag || "").trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!activeSet.has(lower) && !seenLower.has(lower)) {
      seenLower.add(lower);
      result.push(trimmed);
      if (result.length >= maxCount) return result;
    }
  }

  return result;
}

/**
 * Escapes special regex characters in a string.
 */
export function escapeRegExp(string) {
  return String(string || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Removes an image matching the given URL from markdown text.
 * Matches both standard Markdown `![alt](url "caption")` and HTML `<img src="url" .../>`.
 *
 * @param {string} content - Markdown content
 * @param {string} imageSrc - URL of image to remove
 * @returns {string} Updated markdown with image removed
 */
export function removeImageFromMarkdown(content = "", imageSrc = "") {
  if (!content || !imageSrc) return content;
  const escaped = escapeRegExp(imageSrc.trim());

  // 1. Markdown syntax: ![alt](url "optional caption")
  const mdRegex = new RegExp(
    `(?:\r?\n)?\\s*!\\[[^\\]]*\\]\\(\\s*${escaped}(?:\\s+["'][^"']*["'])?\\s*\\)\\s*(?:\r?\n)?`,
    "g"
  );
  // 2. HTML syntax: <img ... src="url" ... />
  const htmlRegex = new RegExp(
    `(?:\r?\n)?\\s*<img\\s+[^>]*src=["']${escaped}["'][^>]*\\/?>\\s*(?:\r?\n)?`,
    "gi"
  );

  let updated = content.replace(mdRegex, "\n\n").replace(htmlRegex, "\n\n");
  // Clean up any excessive newlines created
  updated = updated.replace(/\n{3,}/g, "\n\n").trim();
  return updated;
}

/**
 * Replaces an existing image matching oldSrc with newSrc in markdown text in the exact same location.
 * Preserves captions and existing alt text unless a new alt is provided.
 *
 * @param {string} content - Markdown content
 * @param {string} oldSrc - Existing image URL to find
 * @param {string} newSrc - New image URL to insert
 * @param {string} [newAlt=""] - Optional new alt text
 * @returns {string} Updated markdown content
 */
export function replaceImageInMarkdown(content = "", oldSrc = "", newSrc = "", newAlt = "") {
  if (!content || !oldSrc || !newSrc) return content;
  const escapedOld = escapeRegExp(oldSrc.trim());

  // 1. Match Markdown syntax: ![alt](oldSrc "optional caption")
  const mdRegex = new RegExp(
    `!\\[([^\\]]*)\\]\\(\\s*${escapedOld}(?:\\s+["']([^"']*)["'])?\\s*\\)`,
    "g"
  );
  let replaced = content.replace(mdRegex, (match, capturedAlt, capturedCaption) => {
    const finalAlt = (newAlt || capturedAlt || "Image").trim();
    if (capturedCaption) {
      return `![${finalAlt}](${newSrc.trim()} "${capturedCaption}")`;
    }
    return `![${finalAlt}](${newSrc.trim()})`;
  });

  // 2. Match HTML syntax: <img ... src="oldSrc" ... />
  const htmlRegex = new RegExp(`(<img\\s+[^>]*src=["'])${escapedOld}(["'][^>]*\\/?>)`, "gi");
  replaced = replaced.replace(htmlRegex, `$1${newSrc.trim()}$2`);

  return replaced;
}

