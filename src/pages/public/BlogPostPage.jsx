import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ReadingProgressBar,
  CodeBlock,
  TableOfContents,
  toHeadingSlug,
} from "../../components/blog";
import { TagBadge, TerminalBox, BrutalButton } from "../../components/brutalist";
import {
  Clock,
  Calendar,
  User,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
  Terminal,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { SAMPLE_INITIAL_POST } from "../admin/BlogsCMS.jsx";
import { formatCardDate } from "../../components/blog/BlogCard.jsx";

function XIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 0 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

/**
 * BlogPostPage - Public Long-Form Technical Article Reader (/blogs/:slug)
 */
export default function BlogPostPage() {
  const { slug } = useParams();

  // Initialize post defensively with SAMPLE_INITIAL_POST if matching slug or id,
  // guaranteeing zero layout shift and instant SSR rendering.
  const [post, setPost] = useState(() => {
    if (!slug || slug === SAMPLE_INITIAL_POST.slug || slug === SAMPLE_INITIAL_POST.id) {
      return SAMPLE_INITIAL_POST;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if matching sample post first
    if (!slug || slug === SAMPLE_INITIAL_POST.slug || slug === SAMPLE_INITIAL_POST.id) {
      setPost(SAMPLE_INITIAL_POST);
      setNotFound(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const blogsRef = collection(db, "blogs");
        // Query by slug field
        const q = query(blogsRef, where("slug", "==", slug));
        const snap = await getDocs(q);

        if (!snap.empty && isMounted) {
          const docData = snap.docs[0];
          setPost({ id: docData.id, ...docData.data() });
          setNotFound(false);
          return;
        }

        // Secondary fallback: lookup by doc ID
        const docRef = doc(db, "blogs", slug);
        const singleSnap = await getDoc(docRef);
        if (singleSnap.exists() && isMounted) {
          setPost({ id: singleSnap.id, ...singleSnap.data() });
          setNotFound(false);
          return;
        }

        // Post not found in Firestore
        if (isMounted) {
          setNotFound(true);
          setPost(null);
        }
      } catch (err) {
        console.error("Error fetching article by slug:", err);
        if (isMounted) {
          // In case of network error, check if this is the sample post slug
          if (slug === SAMPLE_INITIAL_POST.slug || slug === SAMPLE_INITIAL_POST.id) {
            setPost(SAMPLE_INITIAL_POST);
            setNotFound(false);
          } else {
            setNotFound(true);
            setPost(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Social Share Handlers
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Ignore clipboard write failure
    }
  };

  const handleShareTwitter = () => {
    if (!post) return;
    const shareText = encodeURIComponent(`${post.title} by Piyush Bhagwat`);
    const shareUrl = encodeURIComponent(currentUrl);
    const url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const shareUrl = encodeURIComponent(currentUrl);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 font-mono py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-32 bg-zinc-900 border border-zinc-800" />
          <div className="h-12 w-3/4 bg-zinc-900 border border-zinc-800" />
          <div className="h-6 w-1/2 bg-zinc-900 border border-zinc-800" />
          <div className="h-64 w-full bg-zinc-900 border border-zinc-800" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-zinc-900" />
            <div className="h-4 w-5/6 bg-zinc-900" />
            <div className="h-4 w-4/6 bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  // 404 / Not Found State
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 font-mono py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <TerminalBox
            title="err.article_not_found"
            status="error"
            className="border-2 border-zinc-800 shadow-brutal p-8 text-center space-y-5"
          >
            <div className="w-12 h-12 mx-auto bg-red-950/40 border border-red-700/60 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-zinc-100">
                Article Not Found
              </h1>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                The requested publication {`"${slug}"`} does not exist or has been unpublished by the author.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/blogs">
                <BrutalButton
                  variant="primary"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Return to Articles Index
                </BrutalButton>
              </Link>
            </div>
          </TerminalBox>
        </div>
      </div>
    );
  }

  const rawDate = post.published_at || post.updated_at || post.created_at;
  const formattedDate = formatCardDate(rawDate);
  const readTime = post.read_time_minutes || 3;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono py-8 px-4 sm:px-6 lg:px-8">
      {/* Sticky Top Reading Progress Bar */}
      <ReadingProgressBar />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
          <Link
            to="/blogs"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-terminal-green transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&larr; Back to all engineering logs</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-zinc-500">
            <Terminal className="w-3.5 h-3.5 text-terminal-cyan" />
            <span>sys.reader.active</span>
          </div>
        </div>

        {/* Article Header Container */}
        <header className="space-y-6">
          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag} label={tag} variant="cyan" />
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed border-l-2 border-terminal-cyan pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Article Telemetry Bar & Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y-2 border-zinc-800 bg-zinc-950 px-4 text-xs">
            {/* Left: Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-zinc-300">
              <span className="flex items-center gap-1.5 font-bold text-terminal-green">
                <User className="w-3.5 h-3.5" />
                <span>Piyush Bhagwat</span>
              </span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-terminal-cyan" />
                <span>{`${readTime} min read`}</span>
              </span>
            </div>

            {/* Right: Share Controls */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 hidden md:inline text-[11px] uppercase tracking-wider font-bold">
                Share:
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-terminal-green text-zinc-400 hover:text-zinc-100 text-[11px] transition-colors"
                title="Copy article link"
                aria-label="Copy article link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-terminal-green" />
                    <span className="text-terminal-green font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleShareTwitter}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-terminal-cyan text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Share on X / Twitter"
                aria-label="Share on X"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-terminal-cyan text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cover Banner */}
          {post.cover_image_url ? (
            <div className="border-2 border-zinc-800 shadow-brutal overflow-hidden bg-zinc-950">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full max-h-[460px] object-cover"
              />
            </div>
          ) : (
            <div className="border-2 border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-brutal-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-terminal-green" />
                  <span>sys.article_viewer.exec</span>
                </div>
                <span className="text-terminal-green">● ARCHIVE_LOADED</span>
              </div>
              <div className="space-y-1 my-3">
                <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                  Publication Stream
                </span>
                <p className="text-sm font-bold text-zinc-300">
                  {post.title}
                </p>
              </div>
              <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-2 flex justify-between">
                <span>AUTHOR: PIYUSH BHAGWAT</span>
                <span>STATUS: VERIFIED</span>
              </div>
            </div>
          )}
        </header>

        {/* 2-Column Responsive Reading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Prose Column */}
          <main className="lg:col-span-8 min-w-0">
            <article className="border-2 border-zinc-800 bg-zinc-950 p-6 sm:p-10 shadow-brutal prose prose-invert prose-emerald max-w-none font-mono text-xs sm:text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  h1: ({ children }) => {
                    const id = toHeadingSlug(children);
                    return (
                      <h1
                        id={id}
                        className="text-2xl sm:text-3xl font-black font-mono text-zinc-100 border-b-2 border-zinc-800 pb-3 mb-6 mt-8 tracking-tight scroll-mt-16"
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ children }) => {
                    const id = toHeadingSlug(children);
                    return (
                      <h2
                        id={id}
                        className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 border-b border-zinc-800 pb-2 mb-4 mt-8 tracking-tight flex items-center gap-2 group scroll-mt-16"
                      >
                        <span className="text-terminal-green">#</span>
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const id = toHeadingSlug(children);
                    return (
                      <h3
                        id={id}
                        className="text-base sm:text-lg font-bold font-mono text-zinc-200 mb-3 mt-6 scroll-mt-16"
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 text-zinc-300 leading-relaxed font-mono">
                      {children}
                    </p>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-terminal-green bg-zinc-900/40 pl-4 py-2 my-4 text-zinc-300 italic not-italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan underline hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border-2 border-zinc-800 shadow-brutal-sm">
                      <table className="w-full border-collapse font-mono text-xs text-left">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-zinc-900 border-b-2 border-zinc-800 text-terminal-green font-bold uppercase">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="p-3 border-r border-zinc-800 last:border-r-0">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="p-3 border-t border-r border-zinc-800 last:border-r-0 text-zinc-300">
                      {children}
                    </td>
                  ),
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt || "Article illustration"}
                      className="border-2 border-zinc-800 my-6 max-w-full h-auto shadow-brutal"
                    />
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1.5 my-4 text-zinc-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 my-4 text-zinc-300">
                      {children}
                    </ol>
                  ),
                  hr: () => <hr className="border-t-2 border-zinc-800 my-8" />,
                }}
              >
                {post.content_markdown || ""}
              </ReactMarkdown>
            </article>

            {/* Author Bio Box */}
            <div className="mt-8 border-2 border-zinc-800 bg-zinc-950 p-6 shadow-brutal space-y-4">
              <div className="flex items-center gap-2 text-xs text-terminal-green uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 text-terminal-cyan" />
                <span>About the Author</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-terminal-green font-black text-lg shadow-brutal-sm shrink-0">
                  PB
                </div>
                <div className="space-y-1 font-mono">
                  <h4 className="text-sm font-bold text-zinc-100">
                    Piyush Bhagwat
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Software engineer specializing in high-performance web applications,
                    distributed backend architectures, and crisp Neo-Brutalist design systems.
                  </p>
                </div>
              </div>
            </div>

            {/* Post Article Navigation Footer */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-900 text-xs">
              <Link to="/blogs">
                <BrutalButton
                  variant="outline"
                  size="sm"
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  All Articles
                </BrutalButton>
              </Link>
              <Link to="/projects">
                <BrutalButton
                  variant="secondary"
                  size="sm"
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                >
                  Explore Projects
                </BrutalButton>
              </Link>
            </div>
          </main>

          {/* Sticky Sidebar (Table of Contents + Telemetry) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Table of Contents */}
              <TableOfContents content={post.content_markdown || ""} />

              {/* Quick Metadata Box */}
              <TerminalBox
                title="article.telemetry"
                className="border-2 border-zinc-800 shadow-brutal-sm p-4 space-y-3 text-xs"
              >
                <div className="space-y-2 text-zinc-400">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span>Reading Depth:</span>
                    <span className="text-terminal-green font-bold">{`${readTime} min`}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span>Topic Tags:</span>
                    <span className="text-terminal-cyan font-bold">{post.tags?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span>Publication:</span>
                    <span className="text-zinc-300 font-bold">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-terminal-green font-bold">● Published</span>
                  </div>
                </div>

                {/* Share Trigger */}
                <div className="pt-2 border-t border-zinc-900">
                  <BrutalButton
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={handleCopyLink}
                    icon={copiedLink ? <Check className="w-3.5 h-3.5 text-terminal-green" /> : <Share2 className="w-3.5 h-3.5" />}
                  >
                    {copiedLink ? "Link Copied!" : "Share Article"}
                  </BrutalButton>
                </div>
              </TerminalBox>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
