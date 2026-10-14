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
