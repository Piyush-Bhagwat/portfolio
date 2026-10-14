import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { ImageUploader } from "../../components/common";
import {
  BentoCard,
  BrutalButton,
  TagBadge,
  TerminalBox,
  StatusPill,
} from "../../components/brutalist";
import {
  User,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  Share2,
} from "lucide-react";

export const DEFAULT_PROFILE = {
  name: "Piyush Bhagwat",
  role: "Full Stack Developer & UI Craftsman",
  tagline: "Crafting minimal, resilient web experiences with modern architecture.",
  bio_paragraphs: [
    "I'm a full-stack engineer focused on building robust, high-performance web applications and intuitive interfaces.",
    "Specialized in React, Node.js, Cloud Firestore, and modern Neo-Brutalist design systems with zero-cost cloud pipelines.",
  ],
  avatar_url: "/assets/myIMG-czvx6SJz.jpg",
  avatar_public_id: "",
  location: "Brahmapuri, Maharashtra, India",
  status_badge: "Available for new opportunities",
  resume_url: "https://drive.google.com/file/d/1_resume_link/view",
  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/Piyush-Bhagwat" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/piyush-bhagwat-1502b4250/" },
    { platform: "x", label: "X / Twitter", url: "https://x.com" },
  ],
};

const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X / Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "email", label: "Email" },
  { value: "website", label: "Personal Site" },
];

/**
 * ProfileCMS - Admin interface to manage site bio, hero headline,
 * Cloudinary avatar, status pills, and social profile links.
 */
export default function ProfileCMS() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [syncing, setSyncing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview'

  // Load profile from Firestore on mount
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setSyncing(true);
      try {
        const docRef = doc(db, "site_config", "profile");
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              name: data.name ?? DEFAULT_PROFILE.name,
              role: data.role ?? DEFAULT_PROFILE.role,
              tagline: data.tagline ?? DEFAULT_PROFILE.tagline,
              bio_paragraphs: Array.isArray(data.bio_paragraphs) && data.bio_paragraphs.length > 0
                ? data.bio_paragraphs
                : DEFAULT_PROFILE.bio_paragraphs,
              avatar_url: data.avatar_url ?? DEFAULT_PROFILE.avatar_url,
              avatar_public_id: data.avatar_public_id ?? "",
              location: data.location ?? DEFAULT_PROFILE.location,
              status_badge: data.status_badge ?? DEFAULT_PROFILE.status_badge,
              resume_url: data.resume_url ?? DEFAULT_PROFILE.resume_url,
              socials: Array.isArray(data.socials) ? data.socials : DEFAULT_PROFILE.socials,
            });
          } else {
            // Cold start: keep default profile
            setProfile(DEFAULT_PROFILE);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "Failed to load profile from Firestore. Showing fallback state.",
          });
        }
      } finally {
        if (isMounted) setSyncing(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Warn before leaving if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Field update helper
  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setFeedback({ type: null, message: "" });
  };

  // Bio paragraph helpers
  const handleParagraphChange = (index, value) => {
    setProfile((prev) => {
      const updated = [...prev.bio_paragraphs];
      updated[index] = value;
      return { ...prev, bio_paragraphs: updated };
    });
    setIsDirty(true);
  };

  const addParagraph = () => {
    setProfile((prev) => ({
      ...prev,
      bio_paragraphs: [...prev.bio_paragraphs, ""],
    }));
    setIsDirty(true);
  };

  const removeParagraph = (index) => {
    setProfile((prev) => ({
      ...prev,
      bio_paragraphs: prev.bio_paragraphs.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const moveParagraph = (index, direction) => {
    setProfile((prev) => {
      const updated = [...prev.bio_paragraphs];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, bio_paragraphs: updated };
    });
    setIsDirty(true);
  };

  // Social link helpers
  const handleSocialChange = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.socials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socials: updated };
    });
    setIsDirty(true);
  };

  const addSocial = () => {
    setProfile((prev) => ({
      ...prev,
      socials: [...prev.socials, { platform: "github", label: "GitHub", url: "" }],
    }));
    setIsDirty(true);
  };

  const removeSocial = (index) => {
    setProfile((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  // Cloudinary Avatar upload handlers
  const handleAvatarUploaded = ({ url, public_id }) => {
    setProfile((prev) => ({
      ...prev,
      avatar_url: url,
      avatar_public_id: public_id,
    }));
    setIsDirty(true);
    setFeedback({
      type: "success",
      message: "Avatar uploaded to Cloudinary. Remember to save changes.",
    });
  };

  const handleAvatarRemoved = () => {
    setProfile((prev) => ({
      ...prev,
      avatar_url: "",
      avatar_public_id: "",
    }));
    setIsDirty(true);
  };

  // Save to Firestore
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      const docRef = doc(db, "site_config", "profile");
      const cleanData = {
        name: profile.name.trim(),
        role: profile.role.trim(),
        tagline: profile.tagline.trim(),
        bio_paragraphs: profile.bio_paragraphs.map((p) => p.trim()).filter(Boolean),
        avatar_url: profile.avatar_url,
        avatar_public_id: profile.avatar_public_id || "",
        location: profile.location.trim(),
        status_badge: profile.status_badge.trim(),
        resume_url: profile.resume_url.trim(),
        socials: profile.socials.map((s) => ({
          platform: s.platform,
          label: s.label.trim(),
          url: s.url.trim(),
        })),
        updated_at: serverTimestamp(),
      };

      await setDoc(docRef, cleanData, { merge: true });
      setIsDirty(false);
      setFeedback({
        type: "success",
        message: "Profile configuration successfully persisted to Firestore (site_config/profile).",
      });
    } catch (err) {
      console.error("Save error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to persist profile configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset profile to default values? Any unsaved edits will be lost.")) {
      setProfile(DEFAULT_PROFILE);
      setIsDirty(true);
      setFeedback({
        type: "info",
        message: "Profile reset to default values. Click Save Profile to persist.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-green mb-1">
            <span>$</span>
            <span>cms.profile.edit --interactive</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            Profile &amp; Bio CMS
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Manage your hero statement, multi-paragraph bio, Cloudinary avatar, and social links.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {syncing && (
            <StatusPill status="SYNCING..." variant="terminal" />
          )}
          {isDirty && (
            <StatusPill status="UNSAVED EDITS" variant="amber" />
          )}
          <BrutalButton
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </BrutalButton>
          <BrutalButton
            variant="terminal"
            size="sm"
            loading={saving}
            disabled={saving}
            onClick={handleSave}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            {saving ? "Saving..." : "Save Profile"}
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
                : feedback.type === "error"
                ? "bg-rose-950/40 border-rose-800 text-rose-300"
                : "bg-cyan-950/40 border-cyan-800 text-cyan-300"
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

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`px-3 py-1.5 font-mono text-xs border ${
            activeTab === "editor"
              ? "bg-zinc-800 border-zinc-700 text-terminal-green font-bold"
              : "border-transparent text-zinc-400"
          }`}
        >
          Edit Form
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-1.5 font-mono text-xs border ${
            activeTab === "preview"
              ? "bg-zinc-800 border-zinc-700 text-terminal-cyan font-bold"
              : "border-transparent text-zinc-400"
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Bento Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor */}
        <div className={`space-y-6 lg:col-span-7 ${activeTab === "preview" ? "hidden lg:block" : ""}`}>
          {/* Section 1: Core Identity */}
          <TerminalBox title="identity_config.json" dotControls={false}>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider pb-1 border-b border-zinc-800">
                <User className="w-3.5 h-3.5 text-terminal-green" />
                <span>Primary Identity</span>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-zinc-300 font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Piyush Bhagwat"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="role" className="block text-zinc-300 font-medium">
                    Professional Role / Title
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={profile.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="Full Stack Developer"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label htmlFor="tagline" className="block text-zinc-300 font-medium">
                  Hero Tagline / Punchline
                </label>
                <input
                  id="tagline"
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="Crafting minimal, resilient web experiences"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                />
              </div>

              {/* Location & Status Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="location" className="block text-zinc-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Maharashtra, India"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="status_badge" className="block text-zinc-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-terminal-green" />
                    Status Badge Text
                  </label>
                  <input
                    id="status_badge"
                    type="text"
                    value={profile.status_badge}
                    onChange={(e) => updateField("status_badge", e.target.value)}
                    placeholder="Available for work"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Resume URL */}
              <div className="space-y-1">
                <label htmlFor="resume_url" className="block text-zinc-300 font-medium flex items-center gap-1">
                  <FileText className="w-3 h-3 text-zinc-400" />
                  Resume URL (Drive / Cloudinary link)
                </label>
                <input
                  id="resume_url"
                  type="url"
                  value={profile.resume_url}
                  onChange={(e) => updateField("resume_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          </TerminalBox>

          {/* Section 2: Avatar & Media Pipeline */}
          <TerminalBox title="avatar_uploader.sh" dotControls={false}>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-terminal-cyan" />
                  Cloudinary Avatar Pipeline
                </span>
                <span className="text-[10px] text-zinc-500">folder: portfolio/avatars</span>
              </div>

              <ImageUploader
                folder="portfolio/avatars"
                value={profile.avatar_url}
                onUploadSuccess={handleAvatarUploaded}
                onRemove={handleAvatarRemoved}
                label="Drop Profile Avatar Here"
              />

              {profile.avatar_public_id && (
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                  <span className="text-zinc-400">Cloudinary ID:</span>
                  <code className="text-terminal-cyan">{profile.avatar_public_id}</code>
                </div>
              )}
            </div>
          </TerminalBox>

          {/* Section 3: Bio Paragraphs */}
          <TerminalBox title="bio_paragraphs.md" dotControls={false}>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">
                  Bio Paragraphs ({profile.bio_paragraphs.length})
                </span>
                <button
                  type="button"
                  onClick={addParagraph}
                  className="text-terminal-green hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  Add Paragraph
                </button>
              </div>

              {profile.bio_paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Paragraph #{index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveParagraph(index, -1)}
                        disabled={index === 0}
                        aria-label="Move paragraph up"
                        className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveParagraph(index, 1)}
                        disabled={index === profile.bio_paragraphs.length - 1}
                        aria-label="Move paragraph down"
                        className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeParagraph(index)}
                        aria-label="Remove paragraph"
                        className="p-1 text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    placeholder="Enter paragraph text..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green p-2 text-zinc-100 font-mono text-xs focus:outline-none resize-y"
                  />
                </div>
              ))}
            </div>
          </TerminalBox>

          {/* Section 4: Social Accounts */}
          <TerminalBox title="social_links.json" dotControls={false}>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-terminal-green" />
                  Social Profiles ({profile.socials.length})
                </span>
                <button
                  type="button"
                  onClick={addSocial}
                  className="text-terminal-green hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  Add Platform
                </button>
              </div>

              <div className="space-y-2.5">
                {profile.socials.map((social, index) => (
                  <div
                    key={index}
                    className="p-3 bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Platform Selector */}
                    <div className="sm:col-span-3">
                      <select
                        value={social.platform}
                        onChange={(e) => handleSocialChange(index, "platform", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green px-2 py-1.5 text-zinc-200 text-xs font-mono focus:outline-none"
                      >
                        {SOCIAL_PLATFORMS.map((plat) => (
                          <option key={plat.value} value={plat.value}>
                            {plat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Label */}
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={social.label}
                        onChange={(e) => handleSocialChange(index, "label", e.target.value)}
                        placeholder="Label"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green px-2 py-1.5 text-zinc-100 text-xs font-mono focus:outline-none"
                      />
                    </div>

                    {/* URL */}
                    <div className="sm:col-span-5">
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green px-2 py-1.5 text-zinc-100 text-xs font-mono focus:outline-none"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        aria-label="Remove social profile"
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TerminalBox>

          {/* Bottom Save Action */}
          <div className="pt-2 flex justify-end">
            <BrutalButton
              variant="terminal"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={handleSave}
              icon={<Save className="w-4 h-4" />}
            >
              {saving ? "Persisting to Firestore..." : "Save Profile Changes"}
            </BrutalButton>
          </div>
        </div>

        {/* Right Column: Live Bento Preview */}
        <div className={`space-y-4 lg:col-span-5 sticky top-20 ${activeTab === "editor" ? "hidden lg:block" : ""}`}>
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-terminal-cyan" />
              Live Bento Preview
            </span>
            <TagBadge variant="terminal" size="sm">Real-time</TagBadge>
          </div>

          {/* Preview Tile: Hero & Bio */}
          <BentoCard
            title="$ whoami"
            subtitle={profile.role || "Developer"}
            dotPattern
            className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-zinc-800"
          >
            <div className="space-y-4">
              {/* Header with Avatar and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-14 h-14 object-cover border-2 border-zinc-700 bg-zinc-800 shrink-0 shadow-brutal-sm"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/assets/myIMG-czvx6SJz.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-lg font-bold shrink-0">
                      {profile.name ? profile.name.slice(0, 2).toUpperCase() : "AB"}
                    </div>
                  )}

                  <div>
                    <h2 className="text-base font-mono font-bold text-zinc-100">
                      {profile.name || "Your Name"}
                    </h2>
                    <p className="text-xs font-mono text-terminal-cyan">
                      {profile.role || "Your Role"}
                    </p>
                  </div>
                </div>

                {profile.status_badge && (
                  <StatusPill status={profile.status_badge} variant="available" />
                )}
              </div>

              {/* Tagline */}
              {profile.tagline && (
                <p className="text-xs font-mono text-zinc-300 italic border-l-2 border-terminal-green pl-2.5 py-0.5">
                  &ldquo;{profile.tagline}&rdquo;
                </p>
              )}

              {/* Bio Paragraphs */}
              <div className="space-y-2 text-xs font-mono text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
                {profile.bio_paragraphs.filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Location & Resume Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  {profile.location || "Location"}
                </span>

                {profile.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-terminal-cyan hover:underline flex items-center gap-1"
                  >
                    <span>Resume</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Social Links Dock */}
              {profile.socials.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {profile.socials
                    .filter((s) => s.url)
                    .map((s, idx) => (
                      <TagBadge key={idx} variant="default" size="sm">
                        {s.label || s.platform}
                      </TagBadge>
                    ))}
                </div>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
