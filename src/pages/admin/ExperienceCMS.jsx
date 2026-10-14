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

  // Save or update milestone
  const handleSaveExperience = async (expData) => {
    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      if (editingExperience) {
        const docRef = doc(db, "experiences", editingExperience.id);
        const updated = {
          ...expData,
          updated_at: serverTimestamp(),
        };
        await setDoc(docRef, updated, { merge: true });

        setExperiences((prev) =>
          prev
            .map((item) => (item.id === editingExperience.id ? { ...item, ...updated } : item))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );

        setFeedback({
          type: "success",
          message: `Milestone "${expData.role}" at ${expData.company} updated successfully.`,
        });
      } else {
        const slugId = `${expData.company}-${expData.role}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const docId = slugId || `exp-${Date.now()}`;
        const docRef = doc(db, "experiences", docId);

        const newExp = {
          ...expData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };

        await setDoc(docRef, newExp);

        setExperiences((prev) =>
          [...prev, { id: docId, ...newExp }].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          )
        );

        setFeedback({
          type: "success",
          message: `Milestone "${expData.role}" added successfully.`,
        });
      }

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

  // Delete milestone
  const handleDeleteExperience = async (exp) => {
    if (!window.confirm(`Delete milestone "${exp.role} at ${exp.company}"?`)) return;

    try {
      await deleteDoc(doc(db, "experiences", exp.id));
      setExperiences((prev) => prev.filter((item) => item.id !== exp.id));
      setFeedback({
        type: "success",
        message: `Milestone "${exp.role}" deleted.`,
      });
    } catch (err) {
      console.error("Delete experience error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete milestone from Firestore.",
      });
    }
  };

  // Reorder milestones
  const handleMoveExperience = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const source = experiences[index];
    const target = experiences[targetIndex];

    const sourceOrder = source.order;
    const targetOrder = target.order;

    const updated = experiences.map((item) => {
      if (item.id === source.id) return { ...item, order: targetOrder };
      if (item.id === target.id) return { ...item, order: sourceOrder };
      return item;
    });

    updated.sort((a, b) => (a.order || 0) - (b.order || 0));
    setExperiences(updated);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "experiences", source.id), { order: targetOrder });
      batch.update(doc(db, "experiences", target.id), { order: sourceOrder });
      await batch.commit();
    } catch (err) {
      console.error("Failed to persist reorder batch:", err);
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-green mb-1">
            <span>$</span>
            <span>sys.cms.experience --timeline</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            Work Experience &amp; Milestones CMS
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Manage your career progression, roles, accomplishments, and tech stack utilized.
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

      {/* Timeline List */}
      {experiences.length === 0 ? (
        <TerminalBox title="experience_empty.log">
          <div className="p-8 text-center space-y-3 font-mono text-xs text-zinc-400">
            <History className="w-8 h-8 text-zinc-600 mx-auto" />
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
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className="p-5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-brutal space-y-4"
            >
              {/* Header row: Role, Period, Order, and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terminal-green" />
                    <h2 className="font-mono text-base font-bold text-zinc-100">
                      {exp.role}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      {exp.company}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1 text-zinc-500">
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
                  <span className="font-mono text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                    #{exp.order}
                  </span>
                </div>
              </div>

              {/* Description */}
              {exp.description && (
                <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                  {exp.description}
                </p>
              )}

              {/* Footer: Skills Used & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 font-mono text-xs">
                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-zinc-500 mr-1">Tech:</span>
                  {Array.isArray(exp.skills_used) && exp.skills_used.length > 0 ? (
                    exp.skills_used.map((sk) => (
                      <TagBadge key={sk} variant="default" size="sm">
                        {sk}
                      </TagBadge>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-600">None specified</span>
                  )}
                </div>

                {/* Move Up/Down, Edit, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveExperience(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${exp.role} up`}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveExperience(index, 1)}
                    disabled={index === experiences.length - 1}
                    aria-label={`Move ${exp.role} down`}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
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
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <ExperienceEditorModal
        isOpen={modalOpen}
        experience={editingExperience}
        onClose={handleCloseModal}
        onSave={handleSaveExperience}
        saving={saving}
      />
    </div>
  );
}
