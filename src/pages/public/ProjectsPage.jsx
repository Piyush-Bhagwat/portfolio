import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { ProjectCard, CaseStudyModal } from "../../components/project";
import { TerminalBox, BrutalButton } from "../../components/brutalist";
import {
  FolderKanban,
  Search,
  X,
  RefreshCw,
  Terminal,
  BookOpen,
  Star,
} from "lucide-react";
import { DEFAULT_PROJECTS } from "../admin/ProjectsCMS.jsx";

/**
 * ProjectsPage - Public Neo-Brutalist Project Portfolio & Case Studies
 */
export default function ProjectsPage() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'featured' | 'case_study'
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects from Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("order", "asc"));
        const snap = await getDocs(q);

        if (!snap.empty && isMounted) {
          const loaded = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setProjects(loaded);
        } else if (isMounted) {
          // If collection is empty, retain DEFAULT_PROJECTS fallback
          setProjects(DEFAULT_PROJECTS);
        }
      } catch (err) {
        console.error("Error fetching projects from Firestore:", err);
        if (isMounted) {
          setProjects(DEFAULT_PROJECTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute tag counts across projects
  const tagCounts = useMemo(() => {
    const counts = {};
    projects.forEach((proj) => {
      if (Array.isArray(proj.tags)) {
        proj.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [projects]);

  const uniqueTags = useMemo(() => Object.keys(tagCounts), [tagCounts]);

  // Compute summary stats
  const featuredCount = useMemo(
    () => projects.filter((p) => Boolean(p.featured)).length,
    [projects]
  );

  const caseStudyCount = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.case_study &&
          (p.case_study.why ||
            (Array.isArray(p.case_study.problems) &&
              p.case_study.problems.length > 0))
      ).length,
    [projects]
  );

  // Filter projects by search, tag, and quick filter tab
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Quick filter tab: all | featured | case_study
      if (activeFilter === "featured" && !proj.featured) return false;
      if (activeFilter === "case_study") {
        const hasCS =
          proj.case_study &&
          (proj.case_study.why ||
            (Array.isArray(proj.case_study.problems) &&
              proj.case_study.problems.length > 0));
        if (!hasCS) return false;
      }

      // Tag filter
      if (selectedTag !== "all") {
        const hasTag =
          Array.isArray(proj.tags) && proj.tags.includes(selectedTag);
        if (!hasTag) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (proj.title || "").toLowerCase().includes(q);
      const descMatch = (proj.description || proj.disc || "")
        .toLowerCase()
        .includes(q);
      const tagMatch =
        Array.isArray(proj.tags) &&
        proj.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || tagMatch;
    });
  }, [projects, activeFilter, selectedTag, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTag("all");
    setActiveFilter("all");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header Section */}
        <div className="border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-brutal-forest dark:shadow-brutal space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-terminal-green">
            <Terminal className="w-4 h-4" />
            <span>sys.projects.engineering_portfolio</span>
            <span className="text-[#4b5e53] dark:text-zinc-600">/</span>
            <span className="text-teal-700 dark:text-terminal-cyan">index.md</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f1a14] dark:text-zinc-100 tracking-tight flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span>Engineered Applications &amp; Projects</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4b5e53] dark:text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Explore production full-stack systems, architectural case studies,
              real-time web applications, and algorithmic computational experiments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#4b5e53] dark:text-zinc-400 border-t border-[#cbdad0] dark:border-zinc-800/80">
            <span className="flex items-center gap-1.5 bg-[#e9f0ea] dark:bg-zinc-900 px-2.5 py-1 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-green animate-pulse" />
              <span>{`${projects.length} Total Projects`}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#e9f0ea] dark:bg-zinc-900 px-2.5 py-1 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-300">
              <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{`${featuredCount} Featured`}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#e9f0ea] dark:bg-zinc-900 px-2.5 py-1 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-300">
              <BookOpen className="w-3.5 h-3.5 text-teal-700 dark:text-terminal-cyan" />
              <span>{`${caseStudyCount} Deep-Dive Case Studies`}</span>
            </span>
          </div>
        </div>

        {/* Search, Filter Tabs & Tag Pills */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-3.5 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5e53] dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, technology, or keywords..."
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

            {/* Quick Filter Tabs (All / Featured / Case Studies) */}
            <div className="flex items-center gap-1 text-xs shrink-0 bg-[#e9f0ea] dark:bg-zinc-900 p-1 border border-[#cbdad0] dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 transition-colors ${
                  activeFilter === "all"
                    ? "bg-emerald-600 dark:bg-terminal-green text-white dark:text-black font-bold"
                    : "text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100"
                }`}
              >
                {`All (${projects.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("featured")}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${
                  activeFilter === "featured"
                    ? "bg-amber-400 text-black font-bold"
                    : "text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100"
                }`}
              >
                <Star className="w-3 h-3" />
                <span>{`Featured (${featuredCount})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("case_study")}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${
                  activeFilter === "case_study"
                    ? "bg-teal-700 text-white dark:bg-terminal-cyan dark:text-black font-bold"
                    : "text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>{`Case Studies (${caseStudyCount})`}</span>
              </button>
            </div>

            {/* Reset Filters CTA */}
            {(searchQuery || selectedTag !== "all" || activeFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-[#e9f0ea] dark:bg-zinc-900 hover:bg-[#cbdad0] dark:hover:bg-zinc-800 text-[#0f1a14] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 text-xs border border-[#cbdad0] dark:border-zinc-800 transition-colors whitespace-nowrap self-start md:self-auto"
              >
                Reset
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
                {`All Stacks (${projects.length})`}
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

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-2 border-[#cbdad0] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 animate-pulse min-h-[320px]"
              >
                <div className="w-full aspect-video bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800" />
                <div className="h-5 bg-[#e9f0ea] dark:bg-zinc-900 w-3/4" />
                <div className="h-3 bg-[#e9f0ea] dark:bg-zinc-900 w-full" />
                <div className="h-3 bg-[#e9f0ea] dark:bg-zinc-900 w-5/6" />
                <div className="flex gap-2 pt-4">
                  <div className="h-6 w-16 bg-[#e9f0ea] dark:bg-zinc-900" />
                  <div className="h-6 w-20 bg-[#e9f0ea] dark:bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <TerminalBox
            title="query_result.status"
            className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal p-8 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center text-[#4b5e53] dark:text-zinc-500">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0f1a14] dark:text-zinc-200">
                No Projects Matching Filter
              </h3>
              <p className="text-xs text-[#4b5e53] dark:text-zinc-400 max-w-md mx-auto">
                No projects matched your current search and filter parameters.
                Try adjusting your search criteria or resetting filters to browse all deployments.
              </p>
            </div>
            <BrutalButton
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset All Filters
            </BrutalButton>
          </TerminalBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id || project.slug || idx}
                project={project}
                featured={project.featured && activeFilter === "all" && !searchQuery && selectedTag === "all" && idx === 0}
                onOpenCaseStudy={setSelectedProject}
                onTagClick={(t) => setSelectedTag(t)}
              />
            ))}
          </div>
        )}

        {/* Back to Home & Explore Articles Footer CTA */}
        <div className="pt-6 border-t border-[#cbdad0] dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4b5e53] dark:text-zinc-500">
          <Link
            to="/"
            className="text-[#4b5e53] dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-terminal-green hover:underline flex items-center gap-1.5"
          >
            <span>&larr; Back to Portfolio Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/blogs"
              className="text-[#4b5e53] dark:text-zinc-400 hover:text-teal-700 dark:hover:text-terminal-cyan hover:underline flex items-center gap-1.5"
            >
              <span>Explore Engineering Articles &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Case Study Modal / Drawer */}
      {selectedProject && (
        <CaseStudyModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
