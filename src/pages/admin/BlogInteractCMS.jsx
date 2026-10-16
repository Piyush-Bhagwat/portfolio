import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import {
  toggleCommentVisibilityWithAggregate,
  addAdminReplyToComment,
} from "../../services/commentsService.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  BrutalButton,
  TerminalBox,
} from "../../components/brutalist";
import RatingStars from "../../components/blog/RatingStars";
import AdminReplyModal from "../../components/admin/AdminReplyModal";
import {
  MessageSquare,
  BookOpen,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  CornerDownRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/**
 * Format timestamp or date for comment entries
 */
export function formatCommentDate(timestamp) {
  if (!timestamp) return "Recent";
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return String(timestamp);
}

/**
 * BlogInteractCMS - Moderation & Community Engagement Center
 * Provides a unified inbox to moderate reader reviews across all technical articles,
 * author verified replies, and toggle soft-delete visibility.
 */
export default function BlogInteractCMS() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  // Filter & Search States
  const [filterPost, setFilterPost] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "visible" | "hidden"
  const [filterRating, setFilterRating] = useState("all"); // "all" | "5" | "4" | "3" | "low"
  const [searchQuery, setSearchQuery] = useState("");

  // Action / Modal States
  const [selectedCommentForReply, setSelectedCommentForReply] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [expandedCommentIds, setExpandedCommentIds] = useState(new Set());

  // Fetch comments and blogs from Firestore
  const fetchCommentsAndBlogs = async () => {
    setLoading(true);
    setFeedback({ type: null, message: "" });
    try {
      // 1. Fetch comments from top-level comments collection
      const commentsRef = collection(db, "comments");
      let loadedComments = [];

      try {
        const commentsQuery = query(commentsRef, orderBy("created_at", "desc"));
        const snap = await getDocs(commentsQuery);
        loadedComments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (queryErr) {
        // Fallback in case orderBy index is building
        console.warn("Retrying comments fetch without orderBy:", queryErr);
        const snap = await getDocs(commentsRef);
        loadedComments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // Sort client-side descending
      loadedComments.sort((a, b) => {
        const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at?.seconds ? a.created_at.seconds * 1000 : 0);
        const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at?.seconds ? b.created_at.seconds * 1000 : 0);
        return timeB - timeA;
      });

      // 2. Fetch blogs to populate article filter and enrich missing titles
      const blogsRef = collection(db, "blogs");
      const blogsSnap = await getDocs(blogsRef);
      const loadedBlogs = blogsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const blogMap = new Map();
      loadedBlogs.forEach((b) => blogMap.set(b.id, b));

      // Enrich comments with blog metadata if missing
      const enrichedComments = loadedComments.map((c) => {
        const matchedBlog = blogMap.get(c.post_id);
        return {
          ...c,
          post_title: c.post_title || matchedBlog?.title || c.post_id,
          post_slug: c.post_slug || matchedBlog?.slug || c.post_id,
        };
      });

      setComments(enrichedComments);
      setBlogs(loadedBlogs);
    } catch (err) {
      console.error("Error fetching comments and blogs:", err);
      setFeedback({
        type: "error",
        message: `Failed to load comments inbox: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsAndBlogs();
  }, []);

  // Compute Platform Metrics
  const metrics = useMemo(() => {
    const total = comments.length;
    const visible = comments.filter((c) => c.status === "visible").length;
    const hidden = comments.filter((c) => c.status === "hidden").length;
    const replied = comments.filter((c) => Boolean(c.admin_reply)).length;

    const visibleWithRating = comments.filter(
      (c) => c.status === "visible" && typeof c.rating === "number" && c.rating > 0
    );
    const avgRating = visibleWithRating.length > 0
      ? (
          visibleWithRating.reduce((acc, c) => acc + Number(c.rating), 0) /
          visibleWithRating.length
        ).toFixed(2)
      : "0.00";

    return {
      total,
      visible,
      hidden,
      replied,
      avgRating,
    };
  }, [comments]);

  // Filtered comments pipeline
  const filteredComments = useMemo(() => {
    return comments.filter((item) => {
      // 1. Filter by Post
      if (filterPost !== "all" && item.post_id !== filterPost) {
        return false;
      }

      // 2. Filter by Status
      if (filterStatus !== "all" && item.status !== filterStatus) {
        return false;
      }

      // 3. Filter by Rating
      if (filterRating !== "all") {
        const r = Number(item.rating) || 0;
        if (filterRating === "5" && r !== 5) return false;
        if (filterRating === "4" && r !== 4) return false;
        if (filterRating === "3" && r !== 3) return false;
        if (filterRating === "low" && r >= 3) return false;
      }

      // 4. Text Search
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        const authorMatch = (item.author_name || "").toLowerCase().includes(queryLower);
        const contentMatch = (item.content || "").toLowerCase().includes(queryLower);
        const postMatch = (item.post_title || "").toLowerCase().includes(queryLower);
        if (!authorMatch && !contentMatch && !postMatch) {
          return false;
        }
      }

      return true;
    });
  }, [comments, filterPost, filterStatus, filterRating, searchQuery]);

  // Toggle Visibility (Soft-Delete)
  const handleToggleVisibility = async (comment) => {
    const nextStatus = comment.status === "visible" ? "hidden" : "visible";
    setActionInProgressId(comment.id);
    setFeedback({ type: null, message: "" });

    try {
      // Optimistic local update
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: nextStatus } : c))
      );

      await toggleCommentVisibilityWithAggregate(db, comment.id, nextStatus);

      setFeedback({
        type: "success",
        message: `Comment by "${comment.author_name}" is now ${
          nextStatus === "visible" ? "VISIBLE" : "HIDDEN (soft-deleted)"
        }. Blog aggregates updated.`,
      });
    } catch (err) {
      console.error("Error toggling comment visibility:", err);
      // Rollback on failure
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: comment.status } : c))
      );
      setFeedback({
        type: "error",
        message: `Failed to update comment visibility: ${err.message}`,
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // Open Reply Modal
  const handleOpenReplyModal = (comment) => {
    setSelectedCommentForReply(comment);
    setIsReplyModalOpen(true);
  };

  // Save Official Reply
  const handleSaveReply = async (commentId, replyContent, replyAuthor) => {
    await addAdminReplyToComment(db, commentId, replyContent, replyAuthor);

    // Update local comment state
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              admin_reply: {
                content: replyContent,
                author: replyAuthor,
                replied_at: new Date(),
              },
            }
          : c
      )
    );

    setFeedback({
      type: "success",
      message: `Official verified author reply published successfully.`,
    });
  };

  // Toggle Comment Text Expansion
  const toggleExpandComment = (id) => {
    setExpandedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cbdad0] dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-terminal-green mb-1">
            <span>sys.cms.blogs</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-terminal-cyan">interact</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f1a14] dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-terminal-green" />
            Blog Community &amp; Interactions
          </h1>
          <p className="text-xs text-[#4b5e53] dark:text-zinc-400 mt-1">
            Moderate discussions across technical articles, author verified replies, and manage comment visibility.
          </p>
        </div>

        {/* Sync Action Button */}
        <div className="flex items-center gap-2.5">
          <BrutalButton
            variant="outline"
            size="sm"
            onClick={fetchCommentsAndBlogs}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Sync Comments
          </BrutalButton>
        </div>
      </div>

      {/* Blog Module Sub-Navigation: Articles vs Interact */}
      <div className="flex items-center gap-2 border-b border-[#cbdad0] dark:border-zinc-800 pb-3">
        <Link
          to="/admin/blogs"
          className="flex items-center gap-2 px-3.5 py-1.5 border border-[#cbdad0] dark:border-zinc-800 bg-[#e9f0ea] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 text-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Articles</span>
        </Link>
        <Link
          to="/admin/blogs/interact"
          className="flex items-center gap-2 px-3.5 py-1.5 border border-[#1b2e23] dark:border-terminal-green bg-emerald-500 dark:bg-terminal-green text-black font-bold text-xs shadow-brutal-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Interact</span>
          <span className="ml-1 px-1.5 py-0.2 bg-black text-terminal-green text-[10px]">
            {metrics.total}
          </span>
        </Link>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
          <div className="text-[10px] text-[#4b5e53] dark:text-zinc-500 uppercase font-bold">Total Reviews</div>
          <div className="text-xl font-bold text-[#0f1a14] dark:text-zinc-100 mt-1">{metrics.total}</div>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Visible (Live)</div>
          <div className="text-xl font-bold text-emerald-700 dark:text-terminal-green mt-1">{metrics.visible}</div>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-bold">Hidden (Soft)</div>
          <div className="text-xl font-bold text-[#4b5e53] dark:text-zinc-400 mt-1">{metrics.hidden}</div>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Avg Rating</div>
          <div className="text-xl font-bold text-[#0f1a14] dark:text-zinc-100 mt-1 flex items-center gap-1">
            <span>★</span> {metrics.avgRating}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm col-span-2 sm:col-span-1">
          <div className="text-[10px] text-cyan-700 dark:text-terminal-cyan uppercase font-bold">Author Replies</div>
          <div className="text-xl font-bold text-[#0f1a14] dark:text-zinc-100 mt-1">{metrics.replied}</div>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedback.type && (
        <div
          className={`p-3.5 border text-xs flex items-start gap-2 shadow-brutal-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Multi-Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-3 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Filter by Post */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#4b5e53] dark:text-zinc-400 font-bold hidden sm:inline">Post:</span>
            <select
              value={filterPost}
              onChange={(e) => setFilterPost(e.target.value)}
              className="bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green max-w-[220px] truncate"
            >
              <option value="all">All Blog Articles ({blogs.length})</option>
              {blogs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter by Status Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1.5 border transition-all ${
                filterStatus === "all"
                  ? "bg-emerald-500 dark:bg-terminal-green text-black font-bold border-[#1b2e23] dark:border-black shadow-brutal-sm"
                  : "bg-[#f4f7f4] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 border-[#cbdad0] dark:border-zinc-800"
              }`}
            >
              All ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("visible")}
              className={`px-2.5 py-1.5 border transition-all ${
                filterStatus === "visible"
                  ? "bg-emerald-400 dark:bg-terminal-cyan text-black font-bold border-[#1b2e23] dark:border-black shadow-brutal-sm"
                  : "bg-[#f4f7f4] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 border-[#cbdad0] dark:border-zinc-800"
              }`}
            >
              Visible ({metrics.visible})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("hidden")}
              className={`px-2.5 py-1.5 border transition-all ${
                filterStatus === "hidden"
                  ? "bg-zinc-400 dark:bg-zinc-700 text-black dark:text-white font-bold border-[#1b2e23] dark:border-zinc-600 shadow-brutal-sm"
                  : "bg-[#f4f7f4] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 border-[#cbdad0] dark:border-zinc-800"
              }`}
            >
              Hidden ({metrics.hidden})
            </button>
          </div>

          {/* 3. Filter by Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#4b5e53] dark:text-zinc-400 font-bold hidden sm:inline">Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green"
            >
              <option value="all">All Stars</option>
              <option value="5">★ 5 Stars Only</option>
              <option value="4">★ 4 Stars</option>
              <option value="3">★ 3 Stars</option>
              <option value="low">★ &lt; 3 Stars (Low)</option>
            </select>
          </div>
        </div>

        {/* 4. Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6e8276] dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search author, keyword, post..."
            className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-green pl-8 pr-3 py-1.5 text-xs text-[#0f1a14] dark:text-zinc-200 placeholder-[#6e8276] dark:placeholder-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Unified Comments Table */}
      <TerminalBox
        title="comments_inbox.tbl"
        className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center text-[#4b5e53] dark:text-zinc-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-terminal-green" />
            <p className="text-xs">Querying Firestore comments across all articles...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center text-[#4b5e53] dark:text-zinc-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0f1a14] dark:text-zinc-200">
                {comments.length === 0 ? "No Comments Found in Database" : "No Matching Comments"}
              </h3>
              <p className="text-xs text-[#4b5e53] dark:text-zinc-400 max-w-sm mx-auto">
                {comments.length === 0
                  ? "When readers submit reviews on public blog posts, they will appear here in the unified moderation inbox."
                  : "Try clearing search keywords or loosening status and rating filters."}
              </p>
            </div>
            {(filterPost !== "all" || filterStatus !== "all" || filterRating !== "all" || searchQuery) && (
              <BrutalButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterPost("all");
                  setFilterStatus("all");
                  setFilterRating("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </BrutalButton>
            )}
          </div>
        ) : (
          /* Comments Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#cbdad0] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-900/80 text-[#4b5e53] dark:text-zinc-400 uppercase tracking-wider text-[11px]">
                  <th className="p-3 font-bold w-44">Target Article</th>
                  <th className="p-3 font-bold w-36">Author</th>
                  <th className="p-3 font-bold w-28">Rating</th>
                  <th className="p-3 font-bold">Review &amp; Reply</th>
                  <th className="p-3 font-bold w-32">Timestamp</th>
                  <th className="p-3 font-bold w-24">Status</th>
                  <th className="p-3 font-bold w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbdad0] dark:divide-zinc-800/80 bg-white dark:bg-zinc-950">
                {filteredComments.map((comment) => {
                  const isExpanded = expandedCommentIds.has(comment.id);
                  const isLong = (comment.content || "").length > 130;
                  const isActioning = actionInProgressId === comment.id;

                  return (
                    <tr
                      key={comment.id}
                      className={`hover:bg-[#e9f0ea]/40 dark:hover:bg-zinc-900/40 transition-colors ${
                        comment.status === "hidden" ? "opacity-75 bg-[#f4f7f4]/50 dark:bg-zinc-950/50" : ""
                      }`}
                    >
                      {/* 1. Target Article */}
                      <td className="p-3 align-top font-sans">
                        <Link
                          to={`/blogs/${comment.post_slug || comment.post_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-terminal-cyan hover:underline truncate max-w-[160px]"
                          title={comment.post_title || comment.post_id}
                        >
                          <span className="truncate">{comment.post_title || comment.post_id}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                        <div className="text-[10px] text-[#6e8276] dark:text-zinc-500 font-mono truncate">
                          id: {comment.post_id}
                        </div>
                      </td>

                      {/* 2. Author */}
                      <td className="p-3 align-top">
                        <div className="font-bold text-[#0f1a14] dark:text-zinc-200 truncate">
                          {comment.author_name}
                        </div>
                        <div className="text-[10px] text-[#6e8276] dark:text-zinc-500">
                          Visitor
                        </div>
                      </td>

                      {/* 3. Rating */}
                      <td className="p-3 align-top">
                        <div className="flex items-center gap-1">
                          <RatingStars rating={comment.rating || 5} size="sm" />
                          <span className="text-[11px] font-bold text-[#0f1a14] dark:text-zinc-300">
                            {comment.rating || 5}
                          </span>
                        </div>
                      </td>

                      {/* 4. Review & Official Reply */}
                      <td className="p-3 align-top font-sans space-y-2">
                        <div className="text-xs text-[#0f1a14] dark:text-zinc-200 leading-relaxed font-sans">
                          {isExpanded || !isLong
                            ? comment.content
                            : `${comment.content.slice(0, 130)}...`}
                          {isLong && (
                            <button
                              type="button"
                              onClick={() => toggleExpandComment(comment.id)}
                              className="ml-1 text-[11px] text-emerald-700 dark:text-terminal-green hover:underline font-mono"
                            >
                              {isExpanded ? "[show less]" : "[read more]"}
                            </button>
                          )}
                        </div>

                        {/* Admin Verified Reply Preview */}
                        {comment.admin_reply && (
                          <div className="p-2 bg-[#f4f7f4] dark:bg-zinc-900/70 border-l-2 border-emerald-600 dark:border-terminal-green space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-terminal-green font-mono font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{comment.admin_reply.author || "Verified Author"}</span>
                              <span className="text-[#6e8276] dark:text-zinc-500 font-normal">
                                · {formatCommentDate(comment.admin_reply.replied_at)}
                              </span>
                            </div>
                            <p className="text-[#4b5e53] dark:text-zinc-300 italic text-[11px] line-clamp-2">
                              &ldquo;{comment.admin_reply.content}&rdquo;
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 5. Timestamp */}
                      <td className="p-3 align-top text-[11px] text-[#4b5e53] dark:text-zinc-400 whitespace-nowrap font-mono">
                        {formatCommentDate(comment.created_at)}
                      </td>

                      {/* 6. Status Pill */}
                      <td className="p-3 align-top">
                        {comment.status === "visible" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-terminal-green" />
                            VISIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                            HIDDEN
                          </span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="p-3 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reply Trigger */}
                          <button
                            type="button"
                            onClick={() => handleOpenReplyModal(comment)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-[#cbdad0] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-900 hover:border-emerald-600 dark:hover:border-terminal-green text-[#0f1a14] dark:text-zinc-200 transition-colors shadow-brutal-sm"
                            title={comment.admin_reply ? "Edit official reply" : "Write official reply"}
                          >
                            <CornerDownRight className="w-3 h-3 text-emerald-600 dark:text-terminal-green" />
                            <span>{comment.admin_reply ? "Edit Reply" : "Reply"}</span>
                          </button>

                          {/* Hide / Unhide Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(comment)}
                            disabled={isActioning}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] border transition-colors shadow-brutal-sm ${
                              comment.status === "visible"
                                ? "border-[#cbdad0] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-400"
                                : "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500 font-bold"
                            }`}
                            title={comment.status === "visible" ? "Soft-hide comment" : "Make comment visible"}
                          >
                            {isActioning ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : comment.status === "visible" ? (
                              <>
                                <EyeOff className="w-3 h-3 text-zinc-500" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600 dark:text-terminal-green" />
                                <span>Unhide</span>
                              </>
                            )}
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

      {/* Admin Reply Modal */}
      <AdminReplyModal
        isOpen={isReplyModalOpen}
        comment={selectedCommentForReply}
        onClose={() => {
          setIsReplyModalOpen(false);
          setSelectedCommentForReply(null);
        }}
        onSaveReply={handleSaveReply}
        adminName={user?.displayName || "Piyush Bhagwat"}
      />
    </div>
  );
}
