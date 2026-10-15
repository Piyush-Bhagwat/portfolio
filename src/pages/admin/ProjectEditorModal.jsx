import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TerminalBox, BrutalButton, TagBadge } from "../../components/brutalist";
import ImageUploader from "../../components/common/ImageUploader.jsx";
import CaseStudyFields from "../../components/admin/CaseStudyFields.jsx";
import {
  X,
  Save,
  FolderKanban,
  ExternalLink,
  GitBranch,
  Calendar,
  Hash,
  Star,
  Plus,
  Link as LinkIcon,
  ImageIcon,
} from "lucide-react";

/**
 * Utility to generate URL-safe slugs from title
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * ProjectEditorModal - Neo-Brutalist modal dialog for creating or updating
 * a portfolio project record with media and metadata.
 */
export default function ProjectEditorModal({
  isOpen,
  project = null,
  nextOrder = 1,
  onClose,
  onSave,
  saving = false,
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(project?.description || "");
  const [tags, setTags] = useState(Array.isArray(project?.tags) ? project.tags : []);
  const [tagInput, setTagInput] = useState("");
  const [liveUrl, setLiveUrl] = useState(project?.live_url || "");
  const [githubUrl, setGithubUrl] = useState(project?.github_url || "");
  const [imageUrl, setImageUrl] = useState(project?.image_url || "");
  const [imagePublicId, setImagePublicId] = useState(project?.image_public_id || "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [date, setDate] = useState(project?.date || new Date().getFullYear().toString());
  const [order, setOrder] = useState(project?.order ?? nextOrder);
  const [caseStudy, setCaseStudy] = useState(
    project?.case_study || {
      enabled: false,
      why: "",
      tech_stack: [],
      learnings: [],
      problems: [],
    }
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setSlug(project.slug || "");
      setSlugTouched(true);
      setDescription(project.description || "");
      setTags(Array.isArray(project.tags) ? project.tags : []);
      setLiveUrl(project.live_url || "");
      setGithubUrl(project.github_url || "");
      setImageUrl(project.image_url || "");
      setImagePublicId(project.image_public_id || "");
      setFeatured(project.featured ?? false);
      setDate(project.date || "");
      setOrder(project.order ?? nextOrder);
      setCaseStudy(
        project.case_study || {
          enabled: false,
          why: "",
          tech_stack: [],
          learnings: [],
          problems: [],
        }
      );
    } else {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setTags([]);
      setLiveUrl("");
      setGithubUrl("");
      setImageUrl("");
      setImagePublicId("");
      setFeatured(false);
      setDate(new Date().getFullYear().toString());
      setOrder(nextOrder);
      setCaseStudy({
        enabled: false,
        why: "",
        tech_stack: [],
        learnings: [],
        problems: [],
      });
    }
    setTagInput("");
    setValidationError("");
  }, [project, isOpen, nextOrder]);

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setValidationError("");
    if (!slugTouched && !project) {
      setSlug(slugify(val));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Project title is required.");
      return;
    }
    if (!slug.trim()) {
      setValidationError("Project slug identifier is required.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Project description is required.");
      return;
    }

    onSave({
      title: title.trim(),
      slug: slugify(slug.trim()),
      description: description.trim(),
      tags,
      live_url: liveUrl.trim(),
      github_url: githubUrl.trim(),
      image_url: imageUrl.trim(),
      image_public_id: imagePublicId.trim(),
      featured: Boolean(featured),
      date: date.trim(),
      order: Number(order) || 1,
      case_study: caseStudy,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col">
        <TerminalBox
          title={project ? "edit_project.sh" : "new_project.sh"}
          className="shadow-brutal-forest dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-[#1b2e23] dark:border-zinc-800 flex flex-col overflow-hidden"
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
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 font-mono text-xs overflow-y-auto max-h-[78vh]"
          >
            {/* Modal Header */}
            <div className="border-b border-[#cbdad0] dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2
                  id="project-modal-title"
                  className="text-base font-bold text-[#0f1a14] dark:text-zinc-100 flex items-center gap-2"
                >
                  <FolderKanban className="w-4 h-4 text-emerald-700 dark:text-terminal-cyan" />
                  {project ? "Edit Project Record" : "Add New Project"}
                </h2>
                <p className="text-[11px] text-[#4b5e53] dark:text-zinc-400 mt-0.5">
                  Configure project metadata, repository URLs, cover banner, and tags.
                </p>
              </div>
            </div>

            {/* Validation alert */}
            {validationError && (
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300">
                [ERROR] {validationError}
              </div>
            )}

            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="project-title" className="block text-[#0f1a14] dark:text-zinc-300 font-medium">
                  Project Title *
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Notes Pool"
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="project-slug" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  Slug (URL-safe) *
                </label>
                <input
                  id="project-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                    setValidationError("");
                  }}
                  placeholder="e.g. notes-pool"
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="project-desc" className="block text-[#0f1a14] dark:text-zinc-300 font-medium">
                Short Description *
              </label>
              <textarea
                id="project-desc"
                rows={3}
                required
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setValidationError("");
                }}
                placeholder="High-level summary of the application, architecture, and purpose..."
                className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan p-2.5 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none resize-y"
              />
            </div>

            {/* URLs: Live Demo & GitHub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="project-live-url" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  Live Demo URL
                </label>
                <input
                  id="project-live-url"
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="project-github-url" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  GitHub Repository URL
                </label>
                <input
                  id="project-github-url"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Date, Order & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5">
                <label htmlFor="project-date" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                  Release Year / Date
                </label>
                <input
                  id="project-date"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="project-order" className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-400" />
                    Display Order
                  </span>
                  <span className="text-[10px] text-[#6e8276] dark:text-zinc-500 font-normal">
                    (Auto-shifts others)
                  </span>
                </label>
                <input
                  id="project-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 font-mono focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 flex items-center gap-2 cursor-pointer h-[38px]">
                <input
                  id="project-featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 dark:text-terminal-cyan bg-white dark:bg-zinc-900 border-[#cbdad0] dark:border-zinc-700 rounded-none focus:ring-0"
                />
                <label htmlFor="project-featured" className="text-[#0f1a14] dark:text-zinc-200 cursor-pointer flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Featured (Bento)
                </label>
              </div>
            </div>

            {/* Tech Stack Tags */}
            <div className="space-y-2">
              <label htmlFor="project-tag-input" className="block text-[#0f1a14] dark:text-zinc-300 font-medium">
                Tech Stack &amp; Categories
              </label>
              <div className="flex gap-2">
                <input
                  id="project-tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  placeholder="Type a tag and press Enter (e.g. React, Firebase, Tailwind)"
                  className="flex-1 bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono focus:outline-none"
                />
                <BrutalButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </BrutalButton>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <TagBadge
                      key={tag}
                      variant="cyan"
                      size="sm"
                      onRemove={() => handleRemoveTag(tag)}
                    >
                      {tag}
                    </TagBadge>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Banner / Media Pipeline */}
            <div className="space-y-2 pt-2 border-t border-[#cbdad0] dark:border-zinc-800">
              <label className="block text-[#0f1a14] dark:text-zinc-300 font-medium flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-cyan" />
                Cover Image / Banner (Cloudinary)
              </label>

              <ImageUploader
                folder="portfolio/projects"
                value={imageUrl}
                onUploadSuccess={({ url, public_id }) => {
                  setImageUrl(url);
                  setImagePublicId(public_id);
                }}
                onRemove={() => {
                  setImageUrl("");
                  setImagePublicId("");
                }}
                label="Upload Project Banner Image"
              />

              <div className="space-y-1 pt-1">
                <label htmlFor="project-manual-img" className="block text-[11px] text-[#4b5e53] dark:text-zinc-500">
                  Or provide image URL directly:
                </label>
                <input
                  id="project-manual-img"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#f4f7f4] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 px-2.5 py-1.5 text-[#0f1a14] dark:text-zinc-300 placeholder-[#6e8276] dark:placeholder-zinc-600 text-[11px] focus:outline-none focus:border-emerald-600 dark:focus:border-zinc-600 font-mono"
                />
              </div>
            </div>

            {/* Structured Case Study Builder */}
            <CaseStudyFields value={caseStudy} onChange={setCaseStudy} />

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
                {saving ? "Saving..." : project ? "Update Project" : "Add Project"}
              </BrutalButton>
            </div>
          </form>
        </TerminalBox>
      </div>
    </div>
  );
}

ProjectEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    live_url: PropTypes.string,
    github_url: PropTypes.string,
    image_url: PropTypes.string,
    image_public_id: PropTypes.string,
    featured: PropTypes.bool,
    date: PropTypes.string,
    order: PropTypes.number,
    case_study: PropTypes.object,
  }),
  nextOrder: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};
