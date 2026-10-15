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
import SkillEditorModal from "./SkillEditorModal.jsx";
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
  Database,
  Terminal,
  Code2,
  GripVertical,
} from "lucide-react";

export const DEFAULT_SKILLS = [
  { id: "react", name: "React JS", category: "frontend", order: 1, featured: true, icon_url: "/assets/react-DWtElvao.png" },
  { id: "javascript", name: "JavaScript", category: "frontend", order: 2, featured: true, icon_url: "/assets/js-BOsfmQ8z.png" },
  { id: "vue", name: "Vue JS", category: "frontend", order: 3, featured: true, icon_url: "/assets/vue-BTF7-REL.png" },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", order: 4, featured: true, icon_url: "" },
  { id: "nodejs", name: "Node JS", category: "backend", order: 5, featured: true, icon_url: "/assets/node-D5TiUOSF.png" },
  { id: "firebase", name: "Firebase", category: "backend", order: 6, featured: true, icon_url: "/assets/fire-cQD0VNta.png" },
  { id: "mongodb", name: "MongoDB", category: "database", order: 7, featured: true, icon_url: "/assets/monDB-TDuXTxH0.png" },
  { id: "git", name: "Git & GitHub", category: "tools", order: 8, featured: true, icon_url: "/assets/github-CogvpTnx.png" },
  { id: "htmlcss", name: "HTML & CSS", category: "frontend", order: 9, featured: false, icon_url: "/assets/htmlcss-aVHLy7_8.png" },
  { id: "cloudinary", name: "Cloudinary CDN", category: "tools", order: 10, featured: false, icon_url: "" },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All Skills" },
  { id: "frontend", label: "Frontend", icon: Code2 },
  { id: "backend", label: "Backend", icon: Terminal },
  { id: "database", label: "Database", icon: Database },
  { id: "tools", label: "Tools", icon: Wrench },
];

/**
 * SkillsCMS - Admin module to manage, reorder, categorize,
 * and feature skills with Cloudinary icons.
 */
export default function SkillsCMS() {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [syncing, setSyncing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchSkills = async () => {
    setSyncing(true);
    try {
      const q = query(collection(db, "skills"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setSkills(fetched);
      } else {
        // Cold start fallback
        setSkills(DEFAULT_SKILLS);
      }
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setFeedback({
        type: "error",
        message: "Failed to load skills from Firestore. Showing fallback items.",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Filter skills by selected category tab
  const filteredSkills = skills.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  // Centralized sequence normalizer & batch Firestore synchronizer
  const reorderAndPersist = async (newList) => {
    setIsReordering(true);
    // Normalize sequentially 1..N
    const normalized = newList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    const prevMap = new Map(skills.map((s) => [s.id, s.order]));
    const changed = normalized.filter((s) => prevMap.get(s.id) !== s.order);

    setSkills(normalized);

    if (changed.length > 0) {
      try {
        const batch = writeBatch(db);
        changed.forEach((s) => {
          batch.update(doc(db, "skills", s.id), { order: s.order });
        });
        await batch.commit();
      } catch (err) {
        console.error("Failed to commit skill reorder:", err);
        setFeedback({
          type: "error",
          message: "Failed to persist new sequence order to Firestore.",
        });
      }
    }
    setIsReordering(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, skill) => {
    e.dataTransfer.setData("text/plain", skill.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(skill.id);
  };

  const handleDragOver = (e, skill) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== skill.id) {
      setDragOverId(skill.id);
    }
  };

  const handleDragEnter = (e, skill) => {
    e.preventDefault();
    if (dragOverId !== skill.id) {
      setDragOverId(skill.id);
    }
  };

  const handleDragLeave = (e, skill) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverId === skill.id) {
        setDragOverId(null);
      }
    }
  };

  const handleDrop = async (e, targetSkill) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetSkill.id) return;

    const sourceIdx = skills.findIndex((s) => s.id === sourceId);
    const targetIdx = skills.findIndex((s) => s.id === targetSkill.id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...skills];
    const [movedItem] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, movedItem);

    await reorderAndPersist(updated);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Modal actions
  const handleOpenAdd = () => {
    setEditingSkill(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSkill(null);
  };

  // Save or update skill with auto-shifting display order
  const handleSaveSkill = async (skillData) => {
    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      const slugId = skillData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const docId = editingSkill ? editingSkill.id : slugId || `skill-${Date.now()}`;
      const docRef = doc(db, "skills", docId);

      const targetOrder = Math.max(
        1,
        parseInt(skillData.order, 10) || (editingSkill ? editingSkill.order : skills.length + 1)
      );

      const payload = {
        ...skillData,
        order: targetOrder,
        updated_at: serverTimestamp(),
      };

      if (!editingSkill) {
        payload.created_at = serverTimestamp();
      }

      // Re-sequence remaining skills around targetOrder
      const withoutCurrent = skills.filter((s) => s.id !== docId);
      const insertIndex = Math.min(targetOrder - 1, withoutCurrent.length);
      const combined = [
        ...withoutCurrent.slice(0, insertIndex),
        { ...payload, id: docId },
        ...withoutCurrent.slice(insertIndex),
      ];

      // Re-normalize all sequentially 1..N
      const normalized = combined.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      const finalSelf = normalized.find((s) => s.id === docId);
      payload.order = finalSelf ? finalSelf.order : targetOrder;

      // Optimistic update
      setSkills(normalized);

      // Save main skill doc
      await setDoc(docRef, payload, { merge: true });

      // Batch update any other skill docs whose order shifted
      const prevMap = new Map(skills.map((s) => [s.id, s.order]));
      const batch = writeBatch(db);
      let batchCount = 0;

      normalized.forEach((s) => {
        if (s.id !== docId && prevMap.get(s.id) !== s.order) {
          batch.update(doc(db, "skills", s.id), { order: s.order });
          batchCount++;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }

      setFeedback({
        type: "success",
        message: `Skill "${skillData.name}" saved successfully with sequence #${payload.order}.`,
      });

      handleCloseModal();
    } catch (err) {
      console.error("Save skill error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to persist skill to Firestore.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete skill and collapse sequence numbers without gaps
  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "skills", skill.id));
      const remaining = skills
        .filter((item) => item.id !== skill.id)
        .map((s, idx) => ({ ...s, order: idx + 1 }));

      setSkills(remaining);

      // Check if any shifted order
      const prevMap = new Map(skills.map((s) => [s.id, s.order]));
      const shifted = remaining.filter((s) => prevMap.get(s.id) !== s.order);

      if (shifted.length > 0) {
        const batch = writeBatch(db);
        shifted.forEach((s) => {
          batch.update(doc(db, "skills", s.id), { order: s.order });
        });
        await batch.commit();
      }

      setFeedback({
        type: "success",
        message: `Skill "${skill.name}" removed and remaining sequence re-indexed.`,
      });
    } catch (err) {
      console.error("Delete skill error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete skill from Firestore.",
      });
    }
  };

  // Move skill up or down and persist orders
  const handleMoveSkill = async (skillId, direction) => {
    const currentIndex = skills.findIndex((s) => s.id === skillId);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const updated = [...skills];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    await reorderAndPersist(updated);
  };

  // Seed default skills to Firestore
  const handleSeedDefaults = async () => {
    if (!window.confirm("Seed default skills into Firestore? This will initialize the skills collection.")) {
      return;
    }
    setSyncing(true);
    setFeedback({ type: null, message: "" });

    try {
      const batch = writeBatch(db);
      DEFAULT_SKILLS.forEach((skill) => {
        const docRef = doc(db, "skills", skill.id);
        batch.set(
          docRef,
          {
            name: skill.name,
            category: skill.category,
            order: skill.order,
            featured: skill.featured,
            icon_url: skill.icon_url,
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );
      });

      await batch.commit();
      await fetchSkills();
      setFeedback({
        type: "success",
        message: "Default skills successfully seeded into Firestore.",
      });
    } catch (err) {
      console.error("Seed skills error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to seed default skills.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cbdad0] dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-terminal-green mb-1">
            <span>$</span>
            <span>sys.cms.skills --manage</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-[#0f1a14] dark:text-zinc-100 tracking-tight">
            Skills &amp; Tech Stack CMS
          </h1>
          <p className="text-xs font-mono text-[#4b5e53] dark:text-zinc-400 mt-1">
            Categorize proficiencies, reorder homepage stack marquee, and manage Cloudinary skill icons.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {syncing && <StatusPill status="SYNCING..." variant="terminal" />}
          {isReordering && <StatusPill status="REORDERING..." variant="terminal" />}
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
            Add Skill
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
                ? "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                : "bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300"
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cbdad0] dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((cat) => {
            const count =
              cat.id === "all"
                ? skills.length
                : skills.filter((s) => s.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  px-3 py-1.5 font-mono text-xs border select-none transition-all flex items-center gap-1.5
                  ${
                    isActive
                      ? "bg-[#e9f0ea] dark:bg-zinc-800 border-[#1b2e23] dark:border-zinc-600 text-emerald-800 dark:text-terminal-green font-bold shadow-brutal-sm"
                      : "bg-white dark:bg-zinc-950 border-[#cbdad0] dark:border-zinc-800 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 hover:border-[#1b2e23] dark:hover:border-zinc-700"
                  }
                `}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] text-[#6e8276] dark:text-zinc-500">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="font-mono text-xs text-[#6e8276] dark:text-zinc-500 flex items-center gap-3">
          <span>
            Featured:{" "}
            <strong className="text-amber-600 dark:text-amber-400">
              {skills.filter((s) => s.featured).length}
            </strong>
          </span>
          <span>•</span>
          <span>
            Total: <strong className="text-[#0f1a14] dark:text-zinc-200">{skills.length}</strong>
          </span>
        </div>
      </div>

      {/* Sequence reordering hint */}
      <div className="flex items-center justify-between font-mono text-[11px] text-[#4b5e53] dark:text-zinc-400 px-0.5">
        <span className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
          Drag cards by the handle or use chevrons to reorder skills. Gaps auto-collapse.
        </span>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <TerminalBox title="skills_empty.log">
          <div className="p-6 text-center space-y-3 font-mono text-xs text-[#4b5e53] dark:text-zinc-400">
            <Layers className="w-8 h-8 text-[#6e8276] dark:text-zinc-600 mx-auto" />
            <p>No skills recorded in category &quot;{activeCategory}&quot;.</p>
            <BrutalButton
              variant="terminal"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add First Skill
            </BrutalButton>
          </div>
        </TerminalBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSkills.map((skill) => {
            const fullIndex = skills.findIndex((s) => s.id === skill.id);
            const isFirst = fullIndex === 0;
            const isLast = fullIndex === skills.length - 1;
            const isDragging = draggedId === skill.id;
            const isDragOver = dragOverId === skill.id && !isDragging;

            return (
              <div
                key={skill.id}
                draggable
                onDragStart={(e) => handleDragStart(e, skill)}
                onDragOver={(e) => handleDragOver(e, skill)}
                onDragEnter={(e) => handleDragEnter(e, skill)}
                onDragLeave={(e) => handleDragLeave(e, skill)}
                onDrop={(e) => handleDrop(e, skill)}
                onDragEnd={handleDragEnd}
                className={`p-3.5 bg-white dark:bg-zinc-950 border-2 transition-all flex flex-col justify-between space-y-3 group ${
                  isDragging
                    ? "opacity-40 border-dashed border-emerald-600 dark:border-terminal-green scale-[0.99] shadow-none"
                    : isDragOver
                    ? "border-emerald-600 dark:border-terminal-green ring-2 ring-emerald-500 dark:ring-terminal-green shadow-lg"
                    : "border-[#1b2e23] dark:border-zinc-800 hover:border-[#1b2e23] dark:hover:border-zinc-700 shadow-brutal-forest dark:shadow-brutal-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Grip & Icon & Title */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="cursor-grab active:cursor-grabbing text-[#4b5e53] dark:text-zinc-500 hover:text-emerald-700 dark:hover:text-terminal-green transition-colors p-0.5"
                      title="Drag to reorder skill sequence"
                      aria-label="Drag handle to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    {skill.icon_url ? (
                      <img
                        src={skill.icon_url}
                        alt={skill.name}
                        className="w-10 h-10 object-contain p-1.5 bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/placeholders/terminal-placeholder.png";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-[#0f1a14] dark:text-zinc-400 shrink-0">
                        {skill.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="font-mono text-sm font-bold text-[#0f1a14] dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{skill.name}</span>
                        {skill.featured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
                        )}
                      </h2>
                      <span className="font-mono text-[10px] text-[#6e8276] dark:text-zinc-500 uppercase tracking-wider">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  {/* Sort Order Badge */}
                  <span className="font-mono text-[11px] text-[#0f1a14] dark:text-zinc-500 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 px-2 py-0.5 font-bold">
                    #{skill.order}
                  </span>
                </div>

                {/* Card Footer: Category tag & Action controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#cbdad0] dark:border-zinc-800/80 font-mono text-xs">
                  <TagBadge
                    variant={
                      skill.category === "frontend"
                        ? "cyan"
                        : skill.category === "backend"
                        ? "terminal"
                        : skill.category === "database"
                        ? "amber"
                        : "default"
                    }
                    size="sm"
                  >
                    {skill.category}
                  </TagBadge>

                  {/* Actions: Move Up / Down, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSkill(skill.id, -1)}
                      disabled={isFirst || isReordering}
                      aria-label={`Move ${skill.name} up`}
                      className="p-1 text-[#4b5e53] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSkill(skill.id, 1)}
                      disabled={isLast || isReordering}
                      aria-label={`Move ${skill.name} down`}
                      className="p-1 text-[#4b5e53] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(skill)}
                      aria-label={`Edit ${skill.name}`}
                      className="p-1 text-[#4b5e53] dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-terminal-cyan ml-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill)}
                      aria-label={`Delete ${skill.name}`}
                      className="p-1 text-[#4b5e53] dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <SkillEditorModal
        isOpen={modalOpen}
        skill={editingSkill}
        onClose={handleCloseModal}
        onSave={handleSaveSkill}
        saving={saving}
        nextOrder={skills.length + 1}
      />
    </div>
  );
}
