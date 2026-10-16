import { getOptimizedImageUrl } from "../services/cloudinary.js";

/**
 * Canonical SEO and Social Sharing Metadata Defaults
 */
export const DEFAULT_SEO = {
  siteName: "Piyush Bhagwat",
  defaultTitle: "Piyush Bhagwat | Full Stack Developer & UI Craftsman",
  defaultDescription:
    "Personal portfolio, architectural case studies, and engineering logs exploring modern web architecture, neo-brutalist interfaces, and resilient full-stack systems.",
  defaultImage:
    "https://res.cloudinary.com/dsdqo228u/image/upload/c_fill,w_1200,h_630,f_jpg,q_80/v1791974281/portfolio/avatars/masarithpr6rydaz1ybq.jpg",
  siteUrl: "https://piyushbhagwat.com",
};

/**
 * Escapes characters for safe inclusion in HTML attribute strings.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates an Open Graph & WhatsApp compliant preview image URL.
 * WhatsApp strictly requires:
 * - Absolute HTTPS URL
 * - JPEG or PNG format (JPEG is universally supported)
 * - File size < 300KB (strict WhatsApp crawler limit)
 * - Recommended dimensions: 1200x630 (1.91:1 aspect ratio)
 *
 * @param {string} [rawUrl] - Cloudinary or external image URL
 * @returns {string} WhatsApp-optimized absolute URL
 */
export function getSocialPreviewImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return DEFAULT_SEO.defaultImage;
  }

  // Cloudinary image transformation for WhatsApp & Social Crawlers:
  // w_1200, h_630, fill crop, JPEG format (f_jpg), quality 80 for crisp <150KB size
  if (rawUrl.includes("res.cloudinary.com") && rawUrl.includes("/image/upload/")) {
    return getOptimizedImageUrl(rawUrl, {
      width: 1200,
      height: 630,
      crop: "fill",
      format: "jpg",
      quality: 80,
    });
  }

  return rawUrl;
}

/**
 * Injects Open Graph, Twitter Cards, and canonical meta tags into an HTML string.
 * Used by Netlify Edge Functions, SSR scrapers, and preview renderers.
 *
 * @param {string} html - Raw HTML string (e.g. index.html)
 * @param {Object} meta - Metadata payload
 * @param {string} [meta.title] - Post title
 * @param {string} [meta.description] - Short summary / excerpt
 * @param {string} [meta.excerpt] - Fallback for description
 * @param {string} [meta.image] - Cover image URL
 * @param {string} [meta.url] - Canonical URL of the post
 * @param {string} [meta.type="article"] - og:type (article, website)
 * @param {string} [meta.siteName] - Site name
 * @returns {string} Transformed HTML with injected meta tags
 */
export function injectMetaIntoHtml(html, meta = {}) {
  if (!html || typeof html !== "string") return "";

  const titleText = meta.title ? `${meta.title} | Piyush Bhagwat` : DEFAULT_SEO.defaultTitle;
  const descriptionText =
    meta.description || meta.excerpt || DEFAULT_SEO.defaultDescription;
  const imageUrl = getSocialPreviewImageUrl(meta.image || meta.cover_image_url);
  const canonicalUrl = meta.url || DEFAULT_SEO.siteUrl;
  const siteName = meta.siteName || DEFAULT_SEO.siteName;
  const type = meta.type || "article";

  // 1. Replace <title> tag
  let transformed = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(titleText)}</title>`
  );

  // 2. Remove any pre-existing Open Graph, Twitter, or description meta tags to prevent duplicates
  transformed = transformed.replace(
    /\s*<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description|title)["'][^>]*>/gi,
    ""
  );

  // 3. Assemble tags block
  const metaTags = [
    `    <!-- Primary SEO & Social Meta Tags -->`,
    `    <meta name="title" content="${escapeHtml(titleText)}" />`,
    `    <meta name="description" content="${escapeHtml(descriptionText)}" />`,
    ``,
    `    <!-- Open Graph / Facebook / WhatsApp -->`,
    `    <meta property="og:type" content="${escapeHtml(type)}" />`,
    `    <meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `    <meta property="og:title" content="${escapeHtml(titleText)}" />`,
    `    <meta property="og:description" content="${escapeHtml(descriptionText)}" />`,
    `    <meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />`,
    `    <meta property="og:image:type" content="image/jpeg" />`,
    `    <meta property="og:image:width" content="1200" />`,
    `    <meta property="og:image:height" content="630" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(meta.title || titleText)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    ``,
    `    <!-- Twitter / X -->`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtml(titleText)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(descriptionText)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    `    <meta name="twitter:image:alt" content="${escapeHtml(meta.title || titleText)}" />`,
  ].join("\n");

  // 4. Inject right before </head>
  if (transformed.includes("</head>")) {
    transformed = transformed.replace("</head>", `${metaTags}\n  </head>`);
  } else {
    transformed = `${metaTags}\n${transformed}`;
  }

  return transformed;
}

/**
 * Dynamically updates document.title and <head> meta tags on the client-side.
 * Used inside React components (e.g. BlogPostPage) to keep browser tab and DOM in sync.
 *
 * @param {Object} meta
 * @param {string} [meta.title]
 * @param {string} [meta.description]
 * @param {string} [meta.excerpt]
 * @param {string} [meta.image]
 * @param {string} [meta.url]
 * @param {string} [meta.type="article"]
 * @returns {Function} Cleanup function to restore previous metadata
 */
export function updateDocumentMeta(meta = {}) {
  if (typeof document === "undefined") {
    return () => {};
  }

  const previousTitle = document.title;
  const titleText = meta.title ? `${meta.title} | Piyush Bhagwat` : DEFAULT_SEO.defaultTitle;
  document.title = titleText;

  const descriptionText =
    meta.description || meta.excerpt || DEFAULT_SEO.defaultDescription;
  const imageUrl = getSocialPreviewImageUrl(meta.image || meta.cover_image_url);
  const currentUrl =
    meta.url || (typeof window !== "undefined" ? window.location.href : DEFAULT_SEO.siteUrl);
  const type = meta.type || "article";
  const siteName = meta.siteName || DEFAULT_SEO.siteName;

  const tagDefinitions = [
    { name: "title", content: titleText },
    { name: "description", content: descriptionText },
    { property: "og:type", content: type },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: titleText },
    { property: "og:description", content: descriptionText },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: meta.title || titleText },
    { property: "og:url", content: currentUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: titleText },
    { name: "twitter:description", content: descriptionText },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: meta.title || titleText },
  ];

  const rollbacks = [];

  tagDefinitions.forEach(({ name, property, content }) => {
    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let el = document.querySelector(selector);

    if (el) {
      const prevContent = el.getAttribute("content");
      rollbacks.push({ el, prevContent, created: false });
      el.setAttribute("content", content);
    } else {
      el = document.createElement("meta");
      if (name) el.setAttribute("name", name);
      if (property) el.setAttribute("property", property);
      el.setAttribute("content", content);
      document.head.appendChild(el);
      rollbacks.push({ el, created: true });
    }
  });

  return () => {
    document.title = previousTitle;
    rollbacks.forEach(({ el, prevContent, created }) => {
      if (created) {
        if (el.parentNode) el.parentNode.removeChild(el);
      } else if (prevContent !== null && prevContent !== undefined) {
        el.setAttribute("content", prevContent);
      }
    });
  };
}
