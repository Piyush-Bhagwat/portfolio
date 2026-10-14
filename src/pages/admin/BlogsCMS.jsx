import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import {
  BrutalButton,
  TagBadge,
  TerminalBox,
  StatusPill,
} from "../../components/brutalist";
import { ConfirmModal } from "../../components/common";
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import {
  DEFAULT_BLOG_MARKDOWN,
  calculateReadTime,
} from "../../utils/blogUtils.js";

export const SAMPLE_INITIAL_POST = {
  id: "building-resilient-web-interfaces",
  title: "Building Resilient Web Interfaces with Neo-Brutalism",
  slug: "building-resilient-web-interfaces",
  excerpt:
    "A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens and modern accessibility standards.",
  content_markdown: DEFAULT_BLOG_MARKDOWN,
  cover_image_url: "",
  cover_image_public_id: "",
  tags: ["React", "UI Engineering", "Design Systems"],
  read_time_minutes: 3,
  published: true,
};

/**
 * Helper to format Firestore timestamps or dates
 */
export function formatBlogDate(timestamp) {
  if (!timestamp) return "Draft";
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(timestamp);
}

/**
 * BlogsCMS - Technical Articles Management Table
 */
export default function BlogsCMS() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "published" | "drafts"
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch blogs from Firestore
  const fetchBlogs = async () => {
    setLoading(true);
    setFeedback({ type: null, message: "" });
    try {
      const blogsRef = collection(db, "blogs");
      const snap = await getDocs(blogsRef);
      const loaded = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort by updated_at or created_at desc
      loaded.sort((a, b) => {
        const timeA = a.updated_at?.seconds || a.created_at?.seconds || 0;
        const timeB = b.updated_at?.seconds || b.created_at?.seconds || 0;
        return timeB - timeA;
      });

      setPosts(loaded);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setFeedback({
        type: "error",
        message: "Failed to load articles from Firestore.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Quick toggle published / draft
  const handleTogglePublish = async (post) => {
    const nextStatus = !post.published;
    const docRef = doc(db, "blogs", post.id);

    try {
      // Optimistic local state update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                published: nextStatus,
                published_at: nextStatus ? (p.published_at || new Date()) : p.published_at,
              }
            : p
        )
      );

      const payload = {
        published: nextStatus,
        updated_at: serverTimestamp(),
      };
      if (nextStatus && !post.published_at) {
        payload.published_at = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });

      setFeedback({
        type: "success",
        message: `Article "${post.title}" set to ${
          nextStatus ? "PUBLISHED" : "DRAFT"
        }.`,
      });
    } catch (err) {
      console.error("Toggle publish error:", err);
      // Rollback on failure
      fetchBlogs();
      setFeedback({
        type: "error",
        message: `Failed to toggle publish status: ${err.message}`,
      });
    }
  };

  // Open deletion modal
  const handleOpenDelete = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);

    try {
      await deleteDoc(doc(db, "blogs", postToDelete.id));

      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setFeedback({
        type: "success",
        message: `Article "${postToDelete.title}" deleted permanently.`,
      });
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Delete article error:", err);
      setFeedback({
        type: "error",
        message: `Failed to delete article: ${err.message}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Seed sample post if collection is empty
  const handleSeedSamplePost = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "blogs", SAMPLE_INITIAL_POST.id);
      const readTime = calculateReadTime(SAMPLE_INITIAL_POST.content_markdown);

      await setDoc(
        docRef,
        {
          ...SAMPLE_INITIAL_POST,
          read_time_minutes: readTime,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          published_at: serverTimestamp(),
        },
        { merge: true }
      );

      setFeedback({
        type: "success",
        message: "Sample Neo-Brutalist technical article seeded into Firestore!",
      });
      await fetchBlogs();
    } catch (err) {
      console.error("Seed post error:", err);
      setFeedback({
        type: "error",
        message: `Failed to seed sample article: ${err.message}`,
      });
      setLoading(false);
    }
  };

  // Copy slug helper
  const handleCopySlug = async (slug) => {
    const fullUrl = `${window.location.origin}/blogs/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // ignore copy error
    }
  };

  // Filter & Search compute
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (filterTab === "published" && !post.published) return false;
      if (filterTab === "drafts" && post.published) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (post.title || "").toLowerCase().includes(q);
      const slugMatch = (post.slug || "").toLowerCase().includes(q);
      const excerptMatch = (post.excerpt || "").toLowerCase().includes(q);
      const tagsMatch = Array.isArray(post.tags) && post.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || slugMatch || excerptMatch || tagsMatch;
    });
  }, [posts, filterTab, searchQuery]);

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-terminal-green mb-1">
            <span>sys.cms.blogs</span>
            <span>/</span>
            <span className="text-terminal-cyan">overview</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-terminal-green" />
            Technical Articles CMS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage, author, and publish developer articles and system design deep dives.
          </p>
        </div>

        {/* Action buttons & telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500">Total:</span>
            <span className="font-bold text-zinc-100">{posts.length}</span>
            <span className="text-zinc-700">|</span>
            <span className="text-emerald-400 font-bold">{publishedCount} published</span>
            <span className="text-zinc-700">|</span>
            <span className="text-amber-400 font-bold">{draftCount} drafts</span>
          </div>

          <BrutalButton
            variant="outline"
            size="sm"
            onClick={fetchBlogs}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Sync
          </BrutalButton>

          <BrutalButton
            variant="terminal"
            size="sm"
            onClick={() => navigate("/admin/blogs/new")}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Article
          </BrutalButton>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedback.type && (
        <div
          className={`
            p-3.5 border text-xs flex items-start gap-2 shadow-brutal-sm
            ${
              feedback.type === "success"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 p-3 border border-zinc-800 shadow-brutal-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 border transition-all ${
              filterTab === "all"
                ? "bg-terminal-green text-black font-bold border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {`All (${posts.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("published")}
            className={`px-3 py-1.5 border transition-all ${
              filterTab === "published"
                ? "bg-terminal-cyan text-black font-bold border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {`Published (${publishedCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("drafts")}
            className={`px-3 py-1.5 border transition-all ${
              filterTab === "drafts"
                ? "bg-amber-400 text-black font-bold border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {`Drafts (${draftCount})`}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, slug, tag..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Articles Table */}
      <TerminalBox
        title="articles_manifest.tbl"
        className="border-2 border-zinc-800 shadow-brutal overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-terminal-green" />
            <p className="text-xs">Querying Firestore blogs collection...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200">
                {posts.length === 0 ? "No Articles Found in Database" : "No Matching Articles"}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {posts.length === 0
                  ? "Your technical blog collection is currently empty. Author a new article or seed a starter post."
                  : `No articles match the current filter criteria ("${searchQuery || filterTab}").`}
              </p>
            </div>

            {posts.length === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <BrutalButton
                  variant="terminal"
                  size="sm"
                  onClick={() => navigate("/admin/blogs/new")}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create First Article
                </BrutalButton>
                <BrutalButton
                  variant="outline"
                  size="sm"
                  onClick={handleSeedSamplePost}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Seed Starter Article
                </BrutalButton>
              </div>
            )}
          </div>
        ) : (
          /* Table Rows */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase select-none">
                  <th className="py-2.5 px-4 font-bold">Article & Category</th>
                  <th className="py-2.5 px-4 font-bold">Slug / Route</th>
                  <th className="py-2.5 px-3 font-bold">Read Time</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Date</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-950">
                {filteredPosts.map((post) => {
                  const readTime =
                    post.read_time_minutes ||
                    calculateReadTime(post.content_markdown || "");
                  const isCopied = copiedSlug === post.slug;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-900/40 transition-colors group"
                    >
                      {/* Title, Excerpt, Tags */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="space-y-1">
                          <Link
                            to={`/admin/blogs/edit/${post.id}`}
                            className="font-bold text-sm text-zinc-100 hover:text-terminal-green transition-colors block line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {Array.isArray(post.tags) &&
                              post.tags.slice(0, 3).map((tag) => (
                                <TagBadge key={tag} variant="terminal" size="sm">
                                  {tag}
                                </TagBadge>
                              ))}
                            {Array.isArray(post.tags) && post.tags.length > 3 && (
                              <span className="text-[10px] text-zinc-500 self-center">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug / Route Preview */}
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500">/blogs/</span>
                          <span className="text-terminal-cyan font-semibold">
                            {post.slug || post.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySlug(post.slug || post.id)}
                            title="Copy public route URL"
                            className="p-1 hover:text-zinc-200 text-zinc-600 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-terminal-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Read Time */}
                      <td className="py-3 px-3 text-zinc-300 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-terminal-cyan shrink-0" />
                          <span>{readTime} min read</span>
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post)}
                          title={`Click to switch to ${post.published ? "DRAFT" : "PUBLISHED"}`}
                          className="focus:outline-none"
                        >
                          <StatusPill
                            status={post.published ? "PUBLISHED" : "DRAFT"}
                            variant={post.published ? "terminal" : "outline"}
                          />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatBlogDate(post.updated_at || post.created_at)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View */}
                          <Link
                            to={`/blogs/${post.slug || post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
                            title="Preview Public Article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/admin/blogs/edit/${post.id}`}
                            className="p-1.5 text-zinc-400 hover:text-terminal-green hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
                            title="Edit Markdown Post"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(post)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TerminalBox>

      {/* Confirmation Modal for Article Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="sys.blog.delete.sh"
        message={`Are you sure you want to permanently delete "${postToDelete?.title || "this article"}"? This action cannot be undone.`}
        confirmText="Delete Article"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
