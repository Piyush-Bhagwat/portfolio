import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { BlogCard } from "../../components/blog";
import { TerminalBox, BrutalButton } from "../../components/brutalist";
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Terminal,
} from "lucide-react";
import { SAMPLE_INITIAL_POST } from "../admin/BlogsCMS.jsx";

/**
 * BlogsPage - Public Bento-Grid Article Index
 */
export default function BlogsPage() {
  const [posts, setPosts] = useState([SAMPLE_INITIAL_POST]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  // Fetch published blogs from Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchPublishedPosts = async () => {
      setLoading(true);
      try {
        const blogsRef = collection(db, "blogs");
        // Defensive: Query published posts
        const q = query(blogsRef, where("published", "==", true));
        const snap = await getDocs(q);

        const loaded = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort by published_at or created_at desc
        loaded.sort((a, b) => {
          const timeA = a.published_at?.seconds || a.updated_at?.seconds || a.created_at?.seconds || 0;
          const timeB = b.published_at?.seconds || b.updated_at?.seconds || b.created_at?.seconds || 0;
          return timeB - timeA;
        });

        if (isMounted) {
          // If Firestore is empty, provide fallback sample post so visitors see rich UI
          setPosts(loaded.length > 0 ? loaded : [SAMPLE_INITIAL_POST]);
        }
      } catch (err) {
        console.error("Error fetching public blogs:", err);
        if (isMounted) {
          // Defensive fallback on error or offline
          setPosts([SAMPLE_INITIAL_POST]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublishedPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique category tags and count occurrences
  const tagCounts = useMemo(() => {
    const counts = {};
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [posts]);

  const uniqueTags = useMemo(() => Object.keys(tagCounts), [tagCounts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tag filter
      if (selectedTag !== "all") {
        const hasTag = Array.isArray(post.tags) && post.tags.includes(selectedTag);
        if (!hasTag) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (post.title || "").toLowerCase().includes(q);
      const excerptMatch = (post.excerpt || "").toLowerCase().includes(q);
      const slugMatch = (post.slug || "").toLowerCase().includes(q);
      const tagMatch = Array.isArray(post.tags) && post.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || excerptMatch || slugMatch || tagMatch;
    });
  }, [posts, selectedTag, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("all");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header Section */}
        <div className="border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-brutal-forest dark:shadow-brutal space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-terminal-green">
            <Terminal className="w-4 h-4" />
            <span>sys.publication.engineering_logs</span>
            <span className="text-[#4b5e53] dark:text-zinc-600">/</span>
            <span className="text-teal-700 dark:text-terminal-cyan">index.md</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f1a14] dark:text-zinc-100 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span>Blogs &amp; Publications</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4b5e53] dark:text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Technical deep dives into building resilient web interfaces, distributed systems,
              tactile Neo-Brutalist design systems, and zero-cost cloud architectures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#4b5e53] dark:text-zinc-400 border-t border-[#cbdad0] dark:border-zinc-800/80">
            <span className="flex items-center gap-1.5 bg-[#e9f0ea] dark:bg-zinc-900 px-2.5 py-1 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-green animate-pulse" />
              <span>{posts.length} Published Articles</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#e9f0ea] dark:bg-zinc-900 px-2.5 py-1 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-terminal-cyan" />
              <span>Free &amp; Open Access</span>
            </span>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-3.5 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5e53] dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, keyword, or concept..."
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-green pl-9 pr-8 py-2 text-xs sm:text-sm text-[#0f1a14] dark:text-zinc-100 focus:outline-none placeholder:text-[#4b5e53] dark:placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b5e53] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clear filters trigger if active */}
            {(searchQuery || selectedTag !== "all") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 bg-[#e9f0ea] dark:bg-zinc-900 hover:bg-[#cbdad0] dark:hover:bg-zinc-800 text-[#0f1a14] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 text-xs border border-[#cbdad0] dark:border-zinc-800 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Clickable Tag Filter Pills */}
          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTag("all")}
                className={`px-3 py-1.5 border transition-all ${
                  selectedTag === "all"
                    ? "bg-emerald-600 dark:bg-terminal-green text-white dark:text-black font-bold border-[#1b2e23] dark:border-black shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-[#e9f0ea] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 border-[#cbdad0] dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-zinc-700"
                }`}
              >
                {`All Topics (${posts.length})`}
              </button>

              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                  className={`px-3 py-1.5 border transition-all ${
                    selectedTag === tag
                      ? "bg-teal-700 text-white dark:bg-terminal-cyan dark:text-black font-bold border-[#1b2e23] dark:border-black shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-[#e9f0ea] dark:bg-zinc-900 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 border-[#cbdad0] dark:border-zinc-800 hover:border-teal-600 dark:hover:border-zinc-700"
                  }`}
                >
                  {`${tag} (${tagCounts[tag]})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bento Articles Grid */}
        {loading ? (
          /* Skeleton Loading Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-2 border-[#cbdad0] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 animate-pulse min-h-[300px]"
              >
                <div className="w-full h-32 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
                <div className="h-4 bg-[#e9f0ea] dark:bg-zinc-900 w-3/4" />
                <div className="h-3 bg-[#e9f0ea] dark:bg-zinc-900 w-full" />
                <div className="h-3 bg-[#e9f0ea] dark:bg-zinc-900 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 bg-[#e9f0ea] dark:bg-zinc-900" />
                  <div className="h-5 w-20 bg-[#e9f0ea] dark:bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty Search Results State */
          <TerminalBox
            title="query_result.status"
            className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal p-8 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center text-[#4b5e53] dark:text-zinc-500">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0f1a14] dark:text-zinc-200">
                No Articles Matching Query
              </h3>
              <p className="text-xs text-[#4b5e53] dark:text-zinc-400 max-w-md mx-auto">
                No published articles matched {`"${searchQuery || selectedTag}"`}.
                Try refining your search terms or reset the filters to browse all engineering notes.
              </p>
            </div>
            <BrutalButton
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Search &amp; Tags
            </BrutalButton>
          </TerminalBox>
        ) : (
          /* Real Bento Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <BlogCard
                key={post.id || post.slug}
                post={post}
                featured={idx === 0 && selectedTag === "all" && !searchQuery}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        )}

        {/* Back to Home / Admin CTA Footer */}
        <div className="pt-6 border-t border-[#cbdad0] dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4b5e53] dark:text-zinc-500">
          <Link
            to="/"
            className="text-[#4b5e53] dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-terminal-green hover:underline flex items-center gap-1.5"
          >
            <span>&larr; Back to Portfolio Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="text-[#4b5e53] dark:text-zinc-400 hover:text-teal-700 dark:hover:text-terminal-cyan hover:underline"
            >
              Explore Projects &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
