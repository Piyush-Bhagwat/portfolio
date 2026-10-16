/**
 * Netlify Edge Function: Dynamic Open Graph & WhatsApp Link Preview Injection
 * Runs at the CDN edge for all `/blogs/*` requests.
 *
 * Intercepts requests for blog articles, fetches post metadata (title, excerpt, cover image)
 * from Cloud Firestore via its public REST API, and injects Open Graph and Twitter Card tags
 * into index.html before returning it.
 *
 * This ensures that web scrapers (WhatsApp, Telegram, Twitter/X, Facebook, LinkedIn, Discord, Slack)
 * receive the blog's title, short summary, and WhatsApp-optimized preview image without needing
 * client-side JavaScript execution.
 */

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dsdqo228u/image/upload/c_fill,w_1200,h_630,f_jpg,q_80/v1791974281/portfolio/avatars/masarithpr6rydaz1ybq.jpg";

const DEFAULT_POST = {
  title: "Building Resilient Web Interfaces with Neo-Brutalism",
  excerpt:
    "A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens and modern accessibility standards.",
  cover_image_url: DEFAULT_AVATAR,
};

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getOptimizedSocialImage(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return DEFAULT_AVATAR;
  }

  // Optimize Cloudinary image for WhatsApp crawler:
  // 1200x630 fill, JPEG format, quality 80 for crisp <150KB size (WhatsApp requires <300KB)
  if (rawUrl.includes("res.cloudinary.com") && rawUrl.includes("/image/upload/")) {
    const marker = "/image/upload/";
    const parts = rawUrl.split(marker);
    if (parts.length === 2) {
      // Strip any existing transform segment
      const after = parts[1].replace(/^[a-z]{1,4}_[^/]+\//, "");
      return `${parts[0]}${marker}c_fill,w_1200,h_630,f_jpg,q_80/${after}`;
    }
  }

  return rawUrl;
}

function injectMetaTags(html, { title, excerpt, imageUrl, canonicalUrl }) {
  const fullTitle = `${title} | Piyush Bhagwat`;
  const escapedTitle = escapeHtml(fullTitle);
  const escapedDesc = escapeHtml(excerpt);
  const escapedImg = escapeHtml(imageUrl);
  const escapedUrl = escapeHtml(canonicalUrl);

  // 1. Replace <title>
  let transformed = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapedTitle}</title>`
  );

  // 2. Strip existing open graph & twitter tags to avoid duplicate definitions
  transformed = transformed.replace(
    /\s*<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description|title)["'][^>]*>/gi,
    ""
  );

  // 3. Assemble tags
  const tags = [
    `    <!-- Injected Dynamic Open Graph & Link Preview (WhatsApp, Twitter, LinkedIn) -->`,
    `    <meta name="title" content="${escapedTitle}" />`,
    `    <meta name="description" content="${escapedDesc}" />`,
    `    <meta property="og:type" content="article" />`,
    `    <meta property="og:site_name" content="Piyush Bhagwat" />`,
    `    <meta property="og:title" content="${escapedTitle}" />`,
    `    <meta property="og:description" content="${escapedDesc}" />`,
    `    <meta property="og:image" content="${escapedImg}" />`,
    `    <meta property="og:image:secure_url" content="${escapedImg}" />`,
    `    <meta property="og:image:type" content="image/jpeg" />`,
    `    <meta property="og:image:width" content="1200" />`,
    `    <meta property="og:image:height" content="630" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(title)}" />`,
    `    <meta property="og:url" content="${escapedUrl}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapedTitle}" />`,
    `    <meta name="twitter:description" content="${escapedDesc}" />`,
    `    <meta name="twitter:image" content="${escapedImg}" />`,
    `    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />`,
  ].join("\n");

  if (transformed.includes("</head>")) {
    return transformed.replace("</head>", `${tags}\n  </head>`);
  }
  return `${tags}\n${transformed}`;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  // Match only /blogs/:slug (ignore /blogs, /blogs/, or assets with extensions like .js/.css)
  if (segments.length !== 2 || segments[0] !== "blogs" || segments[1].includes(".")) {
    return context.next();
  }

  const slug = segments[1];

  // Fetch standard response from Netlify downstream pipeline (dist/index.html)
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();

  let post = null;

  // Handle sample post directly for zero-latency preview
  if (slug === "building-resilient-web-interfaces") {
    post = DEFAULT_POST;
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // 1. Query Firestore REST API for document where slug == slug
      const firestoreUrl =
        "https://firestore.googleapis.com/v1/projects/portfolio-c6f29/databases/(default)/documents:runQuery";
      const firestoreRes = await fetch(firestoreUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "blogs" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "slug" },
                op: "EQUAL",
                value: { stringValue: slug },
              },
            },
            limit: 1,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (firestoreRes.ok) {
        const queryResults = await firestoreRes.json();
        const docObj = queryResults?.[0]?.document;
        if (docObj && docObj.fields) {
          post = {
            title: docObj.fields.title?.stringValue || "",
            excerpt: docObj.fields.excerpt?.stringValue || "",
            cover_image_url: docObj.fields.cover_image_url?.stringValue || "",
          };
        }
      }

      // 2. Fallback: Lookup by document ID
      if (!post || !post.title) {
        const docRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/portfolio-c6f29/databases/(default)/documents/blogs/${encodeURIComponent(slug)}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (docRes.ok) {
          const docData = await docRes.json();
          if (docData && docData.fields) {
            post = {
              title: docData.fields.title?.stringValue || "",
              excerpt: docData.fields.excerpt?.stringValue || "",
              cover_image_url: docData.fields.cover_image_url?.stringValue || "",
            };
          }
        }
      }
    } catch {
      // Ignore background network errors; fallback gracefully below
    }
  }

  if (!post || !post.title) {
    // If post not found or unpublished, return standard index.html unmodified
    return new Response(html, {
      status: response.status,
      headers: response.headers,
    });
  }

  const optimizedImage = getOptimizedSocialImage(post.cover_image_url);
  const updatedHtml = injectMetaTags(html, {
    title: post.title,
    excerpt: post.excerpt || DEFAULT_POST.excerpt,
    imageUrl: optimizedImage,
    canonicalUrl: request.url,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("content-type", "text/html; charset=UTF-8");
  // Allow CDN edge caching of meta tags for 5 minutes
  responseHeaders.set("cache-control", "public, max-age=0, s-maxage=300, must-revalidate");

  return new Response(updatedHtml, {
    status: response.status,
    headers: responseHeaders,
  });
}
