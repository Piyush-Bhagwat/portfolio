import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TerminalBox, BrutalButton } from "../../components/brutalist";
import { ImageUploader } from "../../components/common";
import {
  X,
  Save,
  Wrench,
  Hash,
  Star,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools & DevOps" },
];

/**
 * SkillEditorModal - Neo-Brutalist dialog for creating or editing a skill record.
 */
export default function SkillEditorModal({
  isOpen,
  skill = null,
  onClose,
  onSave,
  saving = false,
}) {
  const [name, setName] = useState(skill?.name || "");
  const [category, setCategory] = useState(skill?.category || "frontend");
  const [order, setOrder] = useState(skill?.order ?? 1);
  const [featured, setFeatured] = useState(skill?.featured ?? true);
  const [iconUrl, setIconUrl] = useState(skill?.icon_url || "");
  const [iconPublicId, setIconPublicId] = useState(skill?.icon_public_id || "");
  const [validationError, setValidationError] = useState("");

  // Sync state when editing an existing skill or resetting
  useEffect(() => {
    if (skill) {
      setName(skill.name || "");
      setCategory(skill.category || "frontend");
      setOrder(skill.order ?? 1);
      setFeatured(skill.featured ?? true);
      setIconUrl(skill.icon_url || "");
      setIconPublicId(skill.icon_public_id || "");
    } else {
      setName("");
      setCategory("frontend");
      setOrder(1);
      setFeatured(true);
      setIconUrl("");
      setIconPublicId("");
    }
    setValidationError("");
  }, [skill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Skill name is required.");
      return;
    }

    onSave({
      name: trimmedName,
      category,
      order: Number(order) || 1,
      featured: Boolean(featured),
      icon_url: iconUrl.trim(),
      icon_public_id: iconPublicId.trim(),
    });
  };

  const handleIconUploaded = ({ url, public_id }) => {
    setIconUrl(url);
    setIconPublicId(public_id);
  };

  const handleIconRemoved = () => {
    setIconUrl("");
    setIconPublicId("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
    >
      <div className="w-full max-w-lg">
        <TerminalBox
          title={skill ? "edit_skill.sh" : "new_skill.sh"}
          className="shadow-brutal-forest dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-[#1b2e23] dark:border-zinc-800"
          actions={
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-5 font-mono text-xs">
            <div className="border-b border-[#cbdad0] dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 id="skill-modal-title" className="text-base font-bold text-[#0f1a14] dark:text-zinc-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600 dark:text-terminal-green" />
                  {skill ? "Edit Skill" : "Add New Skill"}
                </h2>
                <p className="text-[11px] text-[#4b5e53] dark:text-zinc-400 mt-0.5">
                  Configure skill metadata, category grouping, and icon media.
                </p>
              </div>
            </div>

            {validationError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                [ERROR] {validationError}
              </div>
            )}

            {/* Skill Name */}
            <div className="space-y-1.5">
              <label htmlFor="skill-name" className="block text-[#0f1a14] dark:text-zinc-300 font-medium">
                Skill Name *
              </label>
              <input
                id="skill-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError("");
                }}
                placeholder="e.g. React JS, TypeScript, Docker"
                className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
              />
            </div>

            {/* Category & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="skill-category" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  Category
                </label>
                <select
                  id="skill-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-200 font-mono focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-white dark:bg-zinc-900 text-[#0f1a14] dark:text-zinc-100">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="skill-order" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  Sort Order
                </label>
                <input
                  id="skill-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="p-3 bg-[#e9f0ea] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 flex items-center gap-2.5 cursor-pointer">
              <input
                id="skill-featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-emerald-600 dark:text-terminal-green bg-white dark:bg-zinc-900 border-[#cbdad0] dark:border-zinc-700 rounded-none focus:ring-0"
              />
              <label htmlFor="skill-featured" className="text-[#0f1a14] dark:text-zinc-200 cursor-pointer flex items-center gap-1.5 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Featured on Homepage Bento &amp; Marquee
              </label>
            </div>

            {/* Icon Uploader */}
            <div className="space-y-2">
              <label className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-cyan" />
                Skill Icon (Cloudinary)
              </label>
              <ImageUploader
                folder="portfolio/skills"
                value={iconUrl}
                onUploadSuccess={handleIconUploaded}
                onRemove={handleIconRemoved}
                label="Upload Icon Image (SVG/PNG)"
              />
              <div className="space-y-1 pt-1">
                <label htmlFor="icon-url" className="block text-[11px] text-[#4b5e53] dark:text-zinc-500">
                  Or provide external icon URL directly:
                </label>
                <input
                  id="icon-url"
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 px-2.5 py-1.5 text-[#0f1a14] dark:text-zinc-300 placeholder-[#6e8276] dark:placeholder-zinc-600 text-[11px] focus:outline-none focus:border-emerald-600 dark:focus:border-zinc-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#cbdad0] dark:border-zinc-800 flex justify-end gap-2.5">
              <BrutalButton
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </BrutalButton>
              <BrutalButton
                variant="terminal"
                size="sm"
                type="submit"
                loading={saving}
                disabled={saving}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                {saving ? "Saving..." : skill ? "Update Skill" : "Add Skill"}
              </BrutalButton>
            </div>
          </form>
        </TerminalBox>
      </div>
    </div>
  );
}

SkillEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  skill: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    category: PropTypes.string,
    order: PropTypes.number,
    featured: PropTypes.bool,
    icon_url: PropTypes.string,
    icon_public_id: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};
