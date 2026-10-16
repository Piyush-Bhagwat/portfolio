import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useComments } from "../../hooks/useComments.js";
import { calculateNewRatingAverage } from "../../services/commentsService.js";
import {
  ReadingProgressBar,
  CodeBlock,
  TableOfContents,
  toHeadingSlug,
  ImageLightboxModal,
  ArticleActionsBar,
  CommentBox,
  XIcon,
  LinkedInIcon,
} from "../../components/blog";
import { TagBadge, TerminalBox, BrutalButton } from "../../components/brutalist";
import {
  Clock,
  Calendar,
  User,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
  Terminal,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Star,
  MessageSquare,
} from "lucide-react";
import { SAMPLE_INITIAL_POST } from "../admin/BlogsCMS.jsx";
import { formatCardDate } from "../../components/blog/BlogCard.jsx";


/**
 * BlogPostPage - Public Long-Form Article Reader (/blogs/:slug)
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
  const [lightboxImage, setLightboxImage] = useState(null);

  // Progressive comments & cursor pagination hook (Slice 8.4 & 8.5)
  const {
    comments,
    loading: loadingComments,
    loadingMore: loadingMoreComments,
    hasMore: hasMoreComments,
    loadMore: loadMoreComments,
    addComment,
  } = useComments(post?.id, { totalCount: post?.comment_count });

  const handleCommentAdded = (newComment) => {
    if (newComment && post) {
      const oldAvg = Number(post.rating_average) || 0;
      const oldCount = Number(post.rating_count) || 0;
      const newRatingCount = oldCount + 1;
      const newAvg = calculateNewRatingAverage(oldAvg, oldCount, newComment.rating);

      setPost((prev) => ({
        ...prev,
        comment_count: (Number(prev?.comment_count) || 0) + 1,
        rating_count: newRatingCount,
        rating_average: newAvg,
      }));
    }
  };

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
      <div className="min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-32 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
          <div className="h-12 w-3/4 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
          <div className="h-6 w-1/2 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
          <div className="h-64 w-full bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-[#e9f0ea] dark:bg-zinc-900" />
            <div className="h-4 w-5/6 bg-[#e9f0ea] dark:bg-zinc-900" />
            <div className="h-4 w-4/6 bg-[#e9f0ea] dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  // 404 / Not Found State
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <TerminalBox
            title="err.article_not_found"
            status="error"
            className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal p-8 text-center space-y-5"
          >
            <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#0f1a14] dark:text-zinc-100">
                Article Not Found
              </h1>
              <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-mono leading-relaxed">
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

  const ratingAverage = Number(post.rating_average) || 0;
  const ratingCount = Number(post.rating_count) || 0;
  const commentCount = Number(post.comment_count) || 0;

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono py-8 px-4 sm:px-6 lg:px-8">
      {/* Sticky Top Reading Progress Bar */}
      <ReadingProgressBar />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs border-b border-[#cbdad0] dark:border-zinc-800 pb-3">
          <Link
            to="/blogs"
            className="flex items-center gap-1.5 text-[#4b5e53] dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-terminal-green transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&larr; Back to all engineering logs</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[#4b5e53] dark:text-zinc-500">
            <Terminal className="w-3.5 h-3.5 text-teal-700 dark:text-terminal-cyan" />
            <span>sys.reader.active</span>
          </div>
        </div>

        {/* Article Header Container */}
        <header className="space-y-6">
          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag} label={tag} variant="cyan">
                  {tag}
                </TagBadge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f1a14] dark:text-zinc-100 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-[#4b5e53] dark:text-zinc-400 font-sans leading-relaxed border-l-2 border-teal-600 dark:border-terminal-cyan pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Article Metadata Bar & Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 text-xs">
            {/* Left: Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#0f1a14] dark:text-zinc-300">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-terminal-green">
                <User className="w-3.5 h-3.5" />
                <span>Piyush Bhagwat</span>
              </span>
              <span className="text-[#cbdad0] dark:text-zinc-700">|</span>
              <span className="flex items-center gap-1.5 text-[#4b5e53] dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-[#cbdad0] dark:text-zinc-700">|</span>
              <span className="flex items-center gap-1.5 text-[#4b5e53] dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-terminal-cyan" />
                <span>{`${readTime} min read`}</span>
              </span>
              <span className="text-[#cbdad0] dark:text-zinc-700">|</span>

              {/* Star Rating Review Summary Pill */}
              <span
                className="inline-flex items-center gap-1 font-mono text-amber-700 dark:text-amber-400 bg-[#e9f0ea] dark:bg-[#18181b] px-2 py-0.5 border border-[#cbdad0] dark:border-zinc-800"
                title={
                  ratingCount > 0
                    ? `Average Rating: ${ratingAverage.toFixed(1)} / 5 from ${ratingCount} review${ratingCount === 1 ? "" : "s"}`
                    : "No reviews yet"
                }
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    ratingCount > 0
                      ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                      : "text-[#4b5e53] dark:text-zinc-500"
                  }`}
                />
                <span className="font-bold">{ratingCount > 0 ? ratingAverage.toFixed(1) : "New"}</span>
                {ratingCount > 0 && (
                  <span className="text-[#4b5e53] dark:text-zinc-500 text-[10px]">
                    ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                  </span>
                )}
              </span>

              <span className="text-[#cbdad0] dark:text-zinc-700">|</span>

              {/* Comment Count Badge (Clickable Smooth-Scroll Anchor) */}
              <a
                href="#comments-section"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById("comments-section") || document.getElementById("comment-box");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                    target.focus?.();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-terminal-green hover:underline cursor-pointer transition-colors bg-[#e9f0ea] dark:bg-[#18181b] px-2 py-0.5 border border-[#cbdad0] dark:border-zinc-800 font-mono"
                title="Jump to comments and discussion"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{commentCount === 1 ? "1 comment" : `${commentCount} comments`}</span>
              </a>
            </div>

            {/* Right: Share Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[#4b5e53] dark:text-zinc-500 hidden md:inline text-[11px] uppercase tracking-wider font-bold">
                Share:
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-terminal-green text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 text-[11px] transition-colors"
                title="Copy article link"
                aria-label="Copy article link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-terminal-green" />
                    <span className="text-emerald-700 dark:text-terminal-green font-bold">Copied!</span>
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
                className="p-1.5 bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 hover:border-teal-600 dark:hover:border-terminal-cyan text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 transition-colors"
                title="Share on X / Twitter"
                aria-label="Share on X"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="p-1.5 bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 hover:border-teal-600 dark:hover:border-terminal-cyan text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 transition-colors"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cover Banner */}
          {post.cover_image_url ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setLightboxImage({
                  src: post.cover_image_url,
                  alt: post.title,
                  caption: `Cover Banner: ${post.title}`,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxImage({
                    src: post.cover_image_url,
                    alt: post.title,
                    caption: `Cover Banner: ${post.title}`,
                  });
                }
              }}
              className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal overflow-hidden bg-white dark:bg-zinc-950 cursor-zoom-in group relative"
              title="Click thumbnail to view in full screen mode"
              aria-label="View cover banner in fullscreen mode"
            >
              <img
                src={getOptimizedImageUrl(post.cover_image_url, { width: 1200 })}
                alt={post.title}
                className="w-full max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-200"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/85 border border-zinc-700 text-white font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 shadow-brutal-sm">
                <span>Click thumbnail to expand full screen</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-brutal-forest dark:shadow-brutal-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between text-xs text-[#4b5e53] dark:text-zinc-500">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-700 dark:text-terminal-green" />
                  <span>sys.article_viewer.exec</span>
                </div>
                <span className="text-emerald-700 dark:text-terminal-green">● ARCHIVE_LOADED</span>
              </div>
              <div className="space-y-1 my-3">
                <span className="text-[11px] text-[#4b5e53] dark:text-zinc-500 uppercase tracking-widest font-bold">
                  Publication Stream
                </span>
                <p className="text-sm font-bold text-[#0f1a14] dark:text-zinc-300">
                  {post.title}
                </p>
              </div>
              <div className="text-[10px] text-[#4b5e53] dark:text-zinc-600 border-t border-[#cbdad0] dark:border-zinc-900 pt-2 flex justify-between">
                <span>AUTHOR: PIYUSH BHAGWAT</span>
                <span>STATUS: VERIFIED</span>
              </div>
            </div>
          )}
        </header>

        {/* 2-Column Responsive Reading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Prose Column */}
          <main className="lg:col-span-8 min-w-0">
            <article className="border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-brutal-forest dark:shadow-brutal prose dark:prose-invert prose-emerald max-w-none font-mono text-xs sm:text-sm leading-relaxed text-[#0f1a14] dark:text-zinc-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  h1: ({ children }) => {
                    const id = toHeadingSlug(children);
                    return (
                      <h1
                        id={id}
                        className="text-2xl sm:text-3xl font-black font-mono text-[#0f1a14] dark:text-zinc-100 border-b-2 border-[#cbdad0] dark:border-zinc-800 pb-3 mb-6 mt-8 tracking-tight scroll-mt-16"
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
                        className="text-xl sm:text-2xl font-bold font-mono text-[#0f1a14] dark:text-zinc-100 border-b border-[#cbdad0] dark:border-zinc-800 pb-2 mb-4 mt-8 tracking-tight flex items-center gap-2 group scroll-mt-16"
                      >
                        <span className="text-emerald-700 dark:text-terminal-green">#</span>
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const id = toHeadingSlug(children);
                    return (
                      <h3
                        id={id}
                        className="text-base sm:text-lg font-bold font-mono text-[#0f1a14] dark:text-zinc-200 mb-3 mt-6 scroll-mt-16"
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 text-[#0f1a14] dark:text-zinc-300 leading-relaxed font-mono">
                      {children}
                    </p>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-emerald-600 dark:border-terminal-green bg-[#f4f7f4] dark:bg-zinc-900/40 pl-4 py-2 my-4 text-[#0f1a14] dark:text-zinc-300 italic not-italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 dark:text-terminal-cyan underline hover:text-teal-800 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
                      <table className="w-full border-collapse font-mono text-xs text-left">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-[#f4f7f4] dark:bg-zinc-900 border-b-2 border-[#1b2e23] dark:border-zinc-800 text-emerald-800 dark:text-terminal-green font-bold uppercase">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="p-3 border-r border-[#cbdad0] dark:border-zinc-800 last:border-r-0">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="p-3 border-t border-r border-[#cbdad0] dark:border-zinc-800 last:border-r-0 text-[#0f1a14] dark:text-zinc-300">
                      {children}
                    </td>
                  ),
                  img: ({ src, alt, title }) => (
                    <img
                      src={src}
                      alt={alt || "Article illustration"}
                      title={title || alt || "Click to view full screen"}
                      onClick={() =>
                        setLightboxImage({
                          src,
                          alt: alt || "Article illustration",
                          caption: title || alt || "",
                        })
                      }
                      className="border-2 border-[#1b2e23] dark:border-zinc-800 my-6 max-w-full h-auto shadow-brutal-forest dark:shadow-brutal cursor-zoom-in hover:opacity-95 hover:border-emerald-600 dark:hover:border-terminal-green transition-all"
                    />
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1.5 my-4 text-[#0f1a14] dark:text-zinc-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 my-4 text-[#0f1a14] dark:text-zinc-300">
                      {children}
                    </ol>
                  ),
                  hr: () => <hr className="border-t-2 border-[#cbdad0] dark:border-zinc-800 my-8" />,
                }}
              >
                {post.content_markdown || ""}
              </ReactMarkdown>
            </article>

            {/* Author Bio Box */}
            <div className="mt-8 border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-brutal-forest dark:shadow-brutal space-y-4">
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-terminal-green uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 text-teal-700 dark:text-terminal-cyan" />
                <span>About the Author</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-[#e9f0ea] dark:bg-zinc-900 border-2 border-[#1b2e23] dark:border-zinc-800 flex items-center justify-center text-emerald-700 dark:text-terminal-green font-black text-lg shadow-brutal-forest dark:shadow-brutal-sm shrink-0">
                  PB
                </div>
                <div className="space-y-1 font-mono">
                  <h4 className="text-sm font-bold text-[#0f1a14] dark:text-zinc-100">
                    Piyush Bhagwat
                  </h4>
                  <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-sans leading-relaxed">
                    Software engineer specializing in high-performance web applications,
                    distributed backend architectures, and crisp Neo-Brutalist design systems.
                  </p>
                </div>
              </div>
            </div>

            {/* Post Article Navigation Footer */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#cbdad0] dark:border-zinc-900 text-xs">
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

          {/* Sticky Three-Tier Sidebar (Table of Contents + Actions & Progress + Expandable Comments) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              {/* Tier 1: Table of Contents */}
              <TableOfContents content={post.content_markdown || ""} />

              {/* Tier 2: Reading Progress & Action Controls */}
              <ArticleActionsBar
                readTime={readTime}
                formattedDate={formattedDate}
                ratingAverage={ratingAverage}
                ratingCount={ratingCount}
                commentCount={commentCount}
                copiedLink={copiedLink}
                onCopyLink={handleCopyLink}
                onShareTwitter={handleShareTwitter}
                onShareLinkedIn={handleShareLinkedIn}
              />

              {/* Tier 3: Expandable Comment & Review Dock */}
              <CommentBox
                post={post}
                ratingAverage={ratingAverage}
                ratingCount={ratingCount}
                commentCount={commentCount}
                comments={comments}
                loading={loadingComments}
                loadingMore={loadingMoreComments}
                hasMore={hasMoreComments}
                onLoadMore={loadMoreComments}
                onAddComment={addComment}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
