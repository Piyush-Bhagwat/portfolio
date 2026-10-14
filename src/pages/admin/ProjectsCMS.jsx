import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import {
  BrutalButton,
  TagBadge,
  TerminalBox,
  StatusPill,
} from "../../components/brutalist";
import ProjectEditorModal from "./ProjectEditorModal.jsx";
import { migrateLegacyProjects } from "../../scripts/migrateLegacyProjects.js";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  GitBranch,
  FolderKanban,
  Star,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BookOpen,
} from "lucide-react";

export const DEFAULT_PROJECTS = [
  {
    id: "notes-pool",
    title: "Notes Pool",
    slug: "notes-pool",
    description: "Online study material saving and discovery webapp for BCA students with centralized note storage.",
    tags: ["React", "Firebase", "File Storage", "Node.js"],
    live_url: "https://notespool.netlify.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2024",
    order: 1,
    case_study: {
      why: "Motivated by the absence of an organized system for storing study materials in our educational institution, causing difficulties during exam periods.",
      tech_stack: ["ReactJS", "Firebase", "Node.js"],
      learnings: ["File Saving", "CORS Configuration", "Cloud Document Storage"],
      problems: [
        {
          que: "How to deploy environment variables safely",
          ans: "Do not expose secret env files to GitHub. Use host secret files and environment variable injection.",
        },
      ],
    },
  },
  {
    id: "dictionary",
    title: "Dictionary",
    slug: "dictionary",
    description: "Interactive dictionary web application integrating external dictionary APIs with dark mode and word history.",
    tags: ["React", "API", "Front-End", "Tailwind CSS"],
    live_url: "https://dictinory.netlify.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2023",
    order: 2,
    case_study: {
      why: "A personal challenge to develop a dictionary web application utilizing public dictionary APIs with fast querying.",
      tech_stack: ["ReactJS", "Tailwind CSS"],
      learnings: ["APIs", "Themes", "Search History"],
      problems: [],
    },
  },
  {
    id: "flash-card",
    title: "Flash Card",
    slug: "flash-card",
    description: "Online note-taking and revision platform with authentication, state management, and real-time cloud sync.",
    tags: ["React", "Firebase", "Node.js"],
    live_url: "https://flashcard-75ea0.web.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2023",
    order: 3,
    case_study: {
      why: "Built to strengthen React and state management fundamentals with practical interactive revision flashcards.",
      tech_stack: ["ReactJS", "Firebase"],
      learnings: ["Firebase Authentication", "Real-time sync"],
      problems: [],
    },
  },
  {
    id: "banquet-hall",
    title: "Banquet Hall",
    slug: "banquet-hall",
    description: "Responsive commercial showcase website built for a premier banquet hall and events facility.",
    tags: ["HTML", "CSS", "JavaScript", "WebDesign"],
    live_url: "https://piyush-bhagwat.github.io/Lodia-Hall/",
    github_url: "https://github.com/Piyush-Bhagwat/Lodia-Hall",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2023",
    order: 4,
  },
  {
    id: "elementrix-website",
    title: "Elementrix Website",
    slug: "elementrix-website",
    description: "Corporate landing page and brand showcase designed for the Elementrix community.",
    tags: ["HTML", "CSS", "JavaScript"],
    live_url: "https://piyush-bhagwat.github.io/ElmtrixWebsite/",
    github_url: "https://github.com/Piyush-Bhagwat/ElmtrixWebsite",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2023",
    order: 5,
  },
  {
    id: "transportation-problem-solver",
    title: "Transportation Problem Solver",
    slug: "transportation-problem-solver",
    description: "Interactive operations research application solving linear transportation problems with 5 different methods.",
    tags: ["JavaScript", "C++", "Algorithms", "Optimization"],
    live_url: "https://piyush-bhagwat.github.io/Transportation-Problem/",
    github_url: "https://github.com/Piyush-Bhagwat/Transportation-Problem",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2022",
    order: 6,
  },
];

/**
 * ProjectsCMS - Admin module to manage portfolio projects,
 * structured case studies, live links, and media assets.
 */
export default function ProjectsCMS() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [syncing, setSyncing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'featured' | 'case_study'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const fetchProjects = async () => {
    setSyncing(true);
    try {
      const q = query(collection(db, "projects"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setProjects(fetched);
      } else {
        // Cold start fallback
        setProjects(DEFAULT_PROJECTS);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setFeedback({
        type: "error",
        message: "Failed to load projects from Firestore. Displaying local fallback.",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter and search
  const filteredProjects = projects.filter((proj) => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      proj.title?.toLowerCase().includes(q) ||
      proj.description?.toLowerCase().includes(q) ||
      (Array.isArray(proj.tags) && proj.tags.some((t) => t.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    // Filter type match
    if (filterType === "featured") return Boolean(proj.featured);
    if (filterType === "case_study") return Boolean(proj.case_study?.why);

    return true;
  });

  // Modal actions
  const handleOpenAdd = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  // Save or update project
  const handleSaveProject = async (projData) => {
    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      const docId = editingProject ? editingProject.id : projData.slug || `proj-${Date.now()}`;
      const docRef = doc(db, "projects", docId);

      const payload = {
        ...projData,
        updated_at: serverTimestamp(),
      };

      if (!editingProject) {
        payload.created_at = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });

      setProjects((prev) => {
        const exists = prev.some((p) => p.id === docId);
        const updated = exists
          ? prev.map((p) => (p.id === docId ? { ...p, ...payload, id: docId } : p))
          : [...prev, { id: docId, ...payload }];
        return updated.sort((a, b) => (a.order || 0) - (b.order || 0));
      });

      setFeedback({
        type: "success",
        message: `Project "${projData.title}" saved successfully.`,
      });

      handleCloseModal();
    } catch (err) {
      console.error("Save project error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to persist project to Firestore.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (proj) => {
    if (!window.confirm(`Delete project "${proj.title}" permanently?`)) return;

    try {
      await deleteDoc(doc(db, "projects", proj.id));
      setProjects((prev) => prev.filter((p) => p.id !== proj.id));
      setFeedback({
        type: "success",
        message: `Project "${proj.title}" deleted.`,
      });
    } catch (err) {
      console.error("Delete project error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete project from Firestore.",
      });
    }
  };

  // Quick toggle featured status
  const handleToggleFeatured = async (proj) => {
    const nextFeatured = !proj.featured;
    try {
      const docRef = doc(db, "projects", proj.id);
      await setDoc(docRef, { featured: nextFeatured }, { merge: true });

      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, featured: nextFeatured } : p))
      );
    } catch (err) {
      console.error("Toggle featured error:", err);
      setFeedback({
        type: "error",
        message: "Failed to update featured status.",
      });
    }
  };

  // Reorder projects
  const handleMoveProject = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const source = projects[index];
    const target = projects[targetIndex];

    const sourceOrder = source.order;
    const targetOrder = target.order;

    const updated = projects.map((item) => {
      if (item.id === source.id) return { ...item, order: targetOrder };
      if (item.id === target.id) return { ...item, order: sourceOrder };
      return item;
    });

    updated.sort((a, b) => (a.order || 0) - (b.order || 0));
    setProjects(updated);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "projects", source.id), { order: targetOrder });
      batch.update(doc(db, "projects", target.id), { order: sourceOrder });
      await batch.commit();
    } catch (err) {
      console.error("Failed to commit project reorder:", err);
    }
  };

  // Seed default projects to Firestore
  const handleSeedDefaults = async () => {
    if (!window.confirm("Seed default legacy projects into Firestore?")) return;

    setSyncing(true);
    setFeedback({ type: null, message: "" });

    try {
      const res = await migrateLegacyProjects({ overwrite: true });
      await fetchProjects();
      setFeedback({
        type: res.status === "error" ? "error" : "success",
        message: res.message,
      });
    } catch (err) {
      console.error("Seed projects error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to seed default projects.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-cyan mb-1">
            <span>$</span>
            <span>sys.cms.projects --inventory</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            Projects &amp; Case Studies CMS
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Manage portfolio projects, case studies, live links, and media assets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {syncing && <StatusPill status="SYNCING..." variant="terminal" />}
          <BrutalButton
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Seed Defaults
          </BrutalButton>
          <BrutalButton
            variant="terminal"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Project
          </BrutalButton>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.type && (
        <div
          className={`
            p-3.5 border font-mono text-xs flex items-start gap-2.5 shadow-brutal-sm
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
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between font-mono text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or tag..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-terminal-cyan pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 border font-bold transition-all ${
              filterType === "all"
                ? "bg-terminal-cyan text-black border-terminal-cyan"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {`All (${projects.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("featured")}
            className={`px-3 py-1.5 border font-bold flex items-center gap-1.5 transition-all ${
              filterType === "featured"
                ? "bg-terminal-cyan text-black border-terminal-cyan"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            {`Featured (${projects.filter((p) => p.featured).length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("case_study")}
            className={`px-3 py-1.5 border font-bold flex items-center gap-1.5 transition-all ${
              filterType === "case_study"
                ? "bg-terminal-cyan text-black border-terminal-cyan"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {`Case Studies (${projects.filter((p) => p.case_study?.why).length})`}
          </button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {filteredProjects.length === 0 ? (
        <TerminalBox title="projects_empty.log">
          <div className="p-8 text-center space-y-3 font-mono text-xs text-zinc-400">
            <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto" />
            <p>
              {searchQuery || filterType !== "all"
                ? "No projects match your search criteria."
                : "No projects recorded yet in Firestore."}
            </p>
            <div className="flex justify-center gap-2">
              <BrutalButton
                variant="terminal"
                size="sm"
                onClick={handleOpenAdd}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add First Project
              </BrutalButton>
              <BrutalButton
                variant="outline"
                size="sm"
                onClick={handleSeedDefaults}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Seed Defaults
              </BrutalButton>
            </div>
          </div>
        </TerminalBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proj, index) => (
            <div
              key={proj.id}
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-brutal flex flex-col justify-between"
            >
              {/* Card Header & Content */}
              <div className="p-5 space-y-3">
                {/* Top meta row */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-bold">
                      #{proj.order}
                    </span>
                    <span className="font-mono text-[11px] text-terminal-cyan bg-cyan-950/40 border border-cyan-800/60 px-1.5 py-0.5">
                      /{proj.slug}
                    </span>
                    {proj.date && (
                      <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {proj.date}
                      </span>
                    )}
                  </div>

                  {/* Featured Button Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(proj)}
                    title={proj.featured ? "Featured on Bento (Click to unfeature)" : "Not featured (Click to feature)"}
                    className={`flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 border transition-all ${
                      proj.featured
                        ? "bg-amber-950/40 border-amber-800/80 text-amber-300 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Star
                      className={`w-3 h-3 ${proj.featured ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`}
                    />
                    <span>{proj.featured ? "Featured" : "Standard"}</span>
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="font-mono text-base font-bold text-zinc-100 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-terminal-cyan shrink-0" />
                    <span>{proj.title}</span>
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Tags */}
                {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((tag) => (
                      <TagBadge key={tag} variant="cyan" size="sm">
                        {tag}
                      </TagBadge>
                    ))}
                  </div>
                )}

                {/* Badges / Links Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono border-t border-zinc-800/60 text-zinc-400">
                  {proj.live_url && (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-terminal-cyan hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Live Demo
                    </a>
                  )}
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-zinc-300 hover:text-zinc-100 hover:underline"
                    >
                      <GitBranch className="w-3 h-3" />
                      GitHub
                    </a>
                  )}
                  {proj.case_study?.why && (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5">
                      <BookOpen className="w-3 h-3" />
                      Case Study Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveProject(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${proj.title} up`}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveProject(index, 1)}
                    disabled={index === projects.length - 1}
                    aria-label={`Move ${proj.title} down`}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-2">
                  <BrutalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(proj)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </BrutalButton>
                  <BrutalButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteProject(proj)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </BrutalButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Editor Modal */}
      <ProjectEditorModal
        isOpen={modalOpen}
        project={editingProject}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        saving={saving}
      />
    </div>
  );
}
