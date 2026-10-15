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
import ExperienceEditorModal from "./ExperienceEditorModal.jsx";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Building,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  History,
  GripVertical,
} from "lucide-react";

export const DEFAULT_EXPERIENCES = [
  {
    id: "full-stack-dev",
    role: "Full Stack Developer",
    company: "Freelance & Independent Consulting",
    period: "2024 - Present",
    location: "Remote / India",
    description:
      "Architected and deployed responsive full-stack web applications, dynamic client portals, and headless CMS integrations. Designed accessible neo-brutalist user interfaces with modern micro-interactions.",
    skills_used: ["React", "Node.js", "Firebase", "Tailwind CSS", "MongoDB"],
    order: 1,
  },
  {
    id: "frontend-engineer",
    role: "Frontend Engineer",
    company: "Open Source Contributor & Indie Maker",
    period: "2023 - 2024",
    location: "Remote",
    description:
      "Crafted performance-oriented web applications, interactive dictionary tools, flashcard platforms, and reusable component libraries with modular design tokens and automated testing.",
    skills_used: ["JavaScript", "React", "Vue.js", "HTML5", "CSS3", "Git"],
    order: 2,
  },
  {
    id: "cs-degree",
    role: "B.Tech in Computer Science & Engineering",
    company: "University / Academic Milestone",
    period: "2021 - 2025",
    location: "Maharashtra, India",
    description:
      "Deep dive into Data Structures, Algorithms, Distributed Systems, Database Management, and Modern Web Engineering.",
    skills_used: ["DSA", "System Design", "Database Systems", "Software Engineering"],
    order: 3,
  },
];

/**
 * ExperienceCMS - Admin module to manage career timeline,
 * work experience milestones, roles, and skills utilized.
 */
export default function ExperienceCMS() {
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [syncing, setSyncing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchExperiences = async () => {
    setSyncing(true);
    try {
      const q = query(collection(db, "experiences"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setExperiences(fetched);
      } else {
        // Cold start fallback
        setExperiences(DEFAULT_EXPERIENCES);
      }
    } catch (err) {
      console.error("Failed to fetch experiences:", err);
      setFeedback({
        type: "error",
        message: "Failed to load experiences from Firestore. Showing fallback items.",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // Centralized sequence normalizer & batch Firestore synchronizer
  const reorderAndPersist = async (newList) => {
    setIsReordering(true);
    // Normalize sequentially 1..N
    const normalized = newList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    const prevMap = new Map(experiences.map((e) => [e.id, e.order]));
    const changed = normalized.filter((e) => prevMap.get(e.id) !== e.order);

    setExperiences(normalized);

    if (changed.length > 0) {
      try {
        const batch = writeBatch(db);
        changed.forEach((e) => {
          batch.update(doc(db, "experiences", e.id), { order: e.order });
        });
        await batch.commit();
      } catch (err) {
        console.error("Failed to commit milestone reorder:", err);
        setFeedback({
          type: "error",
          message: "Failed to persist new sequence order to Firestore.",
        });
      }
    }
    setIsReordering(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, exp) => {
    e.dataTransfer.setData("text/plain", exp.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(exp.id);
  };

  const handleDragOver = (e, exp) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== exp.id) {
      setDragOverId(exp.id);
    }
  };

  const handleDragEnter = (e, exp) => {
    e.preventDefault();
    if (dragOverId !== exp.id) {
      setDragOverId(exp.id);
    }
  };

  const handleDragLeave = (e, exp) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverId === exp.id) {
        setDragOverId(null);
      }
    }
  };

  const handleDrop = async (e, targetExp) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetExp.id) return;

    const sourceIdx = experiences.findIndex((e) => e.id === sourceId);
    const targetIdx = experiences.findIndex((e) => e.id === targetExp.id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...experiences];
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
    setEditingExperience(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExperience(exp);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExperience(null);
  };

  // Save or update milestone with auto-shifting display order
  const handleSaveExperience = async (expData) => {
    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      const slugId = `${expData.company}-${expData.role}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const docId = editingExperience ? editingExperience.id : slugId || `exp-${Date.now()}`;
      const docRef = doc(db, "experiences", docId);

      const targetOrder = Math.max(
        1,
        parseInt(expData.order, 10) || (editingExperience ? editingExperience.order : experiences.length + 1)
      );

      const payload = {
        ...expData,
        order: targetOrder,
        updated_at: serverTimestamp(),
      };

      if (!editingExperience) {
        payload.created_at = serverTimestamp();
      }

      // Re-sequence remaining experiences around targetOrder
      const withoutCurrent = experiences.filter((e) => e.id !== docId);
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

      const finalSelf = normalized.find((e) => e.id === docId);
      payload.order = finalSelf ? finalSelf.order : targetOrder;

      // Optimistic update
      setExperiences(normalized);

      // Save main milestone doc
      await setDoc(docRef, payload, { merge: true });

      // Batch update any other milestone docs whose order shifted
      const prevMap = new Map(experiences.map((e) => [e.id, e.order]));
      const batch = writeBatch(db);
      let batchCount = 0;

      normalized.forEach((e) => {
        if (e.id !== docId && prevMap.get(e.id) !== e.order) {
          batch.update(doc(db, "experiences", e.id), { order: e.order });
          batchCount++;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }

      setFeedback({
        type: "success",
        message: `Milestone "${expData.role}" saved successfully with sequence #${payload.order}.`,
      });

      handleCloseModal();
    } catch (err) {
      console.error("Save experience error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to persist milestone to Firestore.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete milestone and collapse sequence numbers without gaps
  const handleDeleteExperience = async (exp) => {
    if (!window.confirm(`Delete milestone "${exp.role} at ${exp.company}"?`)) return;

    try {
      await deleteDoc(doc(db, "experiences", exp.id));
      const remaining = experiences
        .filter((item) => item.id !== exp.id)
        .map((e, idx) => ({ ...e, order: idx + 1 }));

      setExperiences(remaining);

      // Check if any shifted order
      const prevMap = new Map(experiences.map((e) => [e.id, e.order]));
      const shifted = remaining.filter((e) => prevMap.get(e.id) !== e.order);

      if (shifted.length > 0) {
        const batch = writeBatch(db);
        shifted.forEach((e) => {
          batch.update(doc(db, "experiences", e.id), { order: e.order });
        });
        await batch.commit();
      }

      setFeedback({
        type: "success",
        message: `Milestone "${exp.role}" deleted and remaining sequence re-indexed.`,
      });
    } catch (err) {
      console.error("Delete experience error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete milestone from Firestore.",
      });
    }
  };

  // Reorder milestones with chevron buttons
  const handleMoveExperience = async (expId, direction) => {
    const currentIndex = experiences.findIndex((e) => e.id === expId);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const updated = [...experiences];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    await reorderAndPersist(updated);
  };

  // Seed default milestones to Firestore
  const handleSeedDefaults = async () => {
    if (!window.confirm("Seed default career milestones into Firestore?")) return;

    setSyncing(true);
    setFeedback({ type: null, message: "" });

    try {
      const batch = writeBatch(db);
      DEFAULT_EXPERIENCES.forEach((exp) => {
        const docRef = doc(db, "experiences", exp.id);
        batch.set(
          docRef,
          {
            role: exp.role,
            company: exp.company,
            period: exp.period,
            location: exp.location,
            description: exp.description,
            skills_used: exp.skills_used,
            order: exp.order,
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );
      });

      await batch.commit();
      await fetchExperiences();
      setFeedback({
        type: "success",
        message: "Default career milestones seeded successfully into Firestore.",
      });
    } catch (err) {
      console.error("Seed experience error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to seed default milestones.",
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
            <span>sys.cms.experience --timeline</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-[#0f1a14] dark:text-zinc-100 tracking-tight">
            Work Experience &amp; Milestones CMS
          </h1>
          <p className="text-xs font-mono text-[#4b5e53] dark:text-zinc-400 mt-1">
            Manage your career progression, roles, accomplishments, and tech stack utilized.
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
            Add Milestone
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
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Sequence reordering hint */}
      <div className="flex items-center justify-between font-mono text-[11px] text-[#4b5e53] dark:text-zinc-400 px-0.5">
        <span className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
          Drag milestones by the handle or use chevrons to reorder career progression. Gaps auto-collapse.
        </span>
      </div>

      {/* Timeline List */}
      {experiences.length === 0 ? (
        <TerminalBox title="experience_empty.log">
          <div className="p-8 text-center space-y-3 font-mono text-xs text-[#4b5e53] dark:text-zinc-400">
            <History className="w-8 h-8 text-[#6e8276] dark:text-zinc-600 mx-auto" />
            <p>No work experience or career milestones recorded yet.</p>
            <BrutalButton
              variant="terminal"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add First Milestone
            </BrutalButton>
          </div>
        </TerminalBox>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {experiences.map((exp) => {
            const fullIndex = experiences.findIndex((e) => e.id === exp.id);
            const isFirst = fullIndex === 0;
            const isLast = fullIndex === experiences.length - 1;
            const isDragging = draggedId === exp.id;
            const isDragOver = dragOverId === exp.id && !isDragging;

            return (
              <div
                key={exp.id}
                draggable
                onDragStart={(e) => handleDragStart(e, exp)}
                onDragOver={(e) => handleDragOver(e, exp)}
                onDragEnter={(e) => handleDragEnter(e, exp)}
                onDragLeave={(e) => handleDragLeave(e, exp)}
                onDrop={(e) => handleDrop(e, exp)}
                onDragEnd={handleDragEnd}
                className={`p-5 bg-white dark:bg-zinc-950 border-2 transition-all space-y-4 ${
                  isDragging
                    ? "opacity-40 border-dashed border-emerald-600 dark:border-terminal-green scale-[0.99] shadow-none"
                    : isDragOver
                    ? "border-emerald-600 dark:border-terminal-green ring-2 ring-emerald-500 dark:ring-terminal-green shadow-lg"
                    : "border-[#1b2e23] dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-zinc-700 shadow-brutal-forest dark:shadow-brutal"
                }`}
              >
                {/* Header row: Role, Period, Order, and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#cbdad0] dark:border-zinc-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-grab active:cursor-grabbing text-[#4b5e53] dark:text-zinc-500 hover:text-emerald-700 dark:hover:text-terminal-green transition-colors p-0.5"
                        title="Drag to reorder milestone sequence"
                        aria-label="Drag handle to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-green" />
                      <h2 className="font-mono text-base font-bold text-[#0f1a14] dark:text-zinc-100">
                        {exp.role}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#4b5e53] dark:text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[#0f1a14] dark:text-zinc-300 font-semibold">
                        <Building className="w-3.5 h-3.5 text-[#6e8276] dark:text-zinc-500" />
                        {exp.company}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1 text-[#6e8276] dark:text-zinc-500">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TagBadge variant="terminal" size="sm">
                      <Calendar className="w-3 h-3 mr-1 inline" />
                      {exp.period}
                    </TagBadge>
                    <span className="font-mono text-xs text-[#4b5e53] dark:text-zinc-500 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 px-2 py-0.5 font-bold">
                      #{exp.order}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {exp.description && (
                  <p className="font-mono text-xs text-[#2c3e34] dark:text-zinc-300 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {/* Footer: Skills Used & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#cbdad0] dark:border-zinc-800/80 font-mono text-xs">
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-[#4b5e53] dark:text-zinc-500 mr-1">Tech:</span>
                    {Array.isArray(exp.skills_used) && exp.skills_used.length > 0 ? (
                      exp.skills_used.map((sk) => (
                        <TagBadge key={sk} variant="default" size="sm">
                          {sk}
                        </TagBadge>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#6e8276] dark:text-zinc-600">None specified</span>
                    )}
                  </div>

                  {/* Move Up/Down, Edit, Delete */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleMoveExperience(exp.id, -1)}
                      disabled={isFirst || isReordering}
                      aria-label={`Move ${exp.role} up`}
                      className="p-1 text-[#6e8276] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200 disabled:opacity-20"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveExperience(exp.id, 1)}
                      disabled={isLast || isReordering}
                      aria-label={`Move ${exp.role} down`}
                      className="p-1 text-[#6e8276] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200 disabled:opacity-20"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <BrutalButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(exp)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </BrutalButton>
                    <BrutalButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteExperience(exp)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </BrutalButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <ExperienceEditorModal
        isOpen={modalOpen}
        experience={editingExperience}
        onClose={handleCloseModal}
        onSave={handleSaveExperience}
        saving={saving}
        nextOrder={experiences.length + 1}
      />
    </div>
  );
}
