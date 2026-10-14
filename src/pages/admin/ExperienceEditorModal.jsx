import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TerminalBox, BrutalButton, TagBadge } from "../../components/brutalist";
import {
  X,
  Save,
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Hash,
  Plus,
} from "lucide-react";

/**
 * ExperienceEditorModal - Dialog for adding or updating a career milestone or work experience.
 */
export default function ExperienceEditorModal({
  isOpen,
  experience = null,
  onClose,
  onSave,
  saving = false,
}) {
  const [role, setRole] = useState(experience?.role || "");
  const [company, setCompany] = useState(experience?.company || "");
  const [period, setPeriod] = useState(experience?.period || "");
  const [location, setLocation] = useState(experience?.location || "");
  const [description, setDescription] = useState(experience?.description || "");
  const [skillsUsed, setSkillsUsed] = useState(
    Array.isArray(experience?.skills_used) ? experience.skills_used : []
  );
  const [skillInput, setSkillInput] = useState("");
  const [order, setOrder] = useState(experience?.order ?? 1);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (experience) {
      setRole(experience.role || "");
      setCompany(experience.company || "");
      setPeriod(experience.period || "");
      setLocation(experience.location || "");
      setDescription(experience.description || "");
      setSkillsUsed(Array.isArray(experience.skills_used) ? experience.skills_used : []);
      setOrder(experience.order ?? 1);
    } else {
      setRole("");
      setCompany("");
      setPeriod("");
      setLocation("");
      setDescription("");
      setSkillsUsed([]);
      setOrder(1);
    }
    setSkillInput("");
    setValidationError("");
  }, [experience, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsUsed.includes(trimmed)) {
      setSkillsUsed([...skillsUsed, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsUsed(skillsUsed.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role.trim()) {
      setValidationError("Role / Position title is required.");
      return;
    }
    if (!company.trim()) {
      setValidationError("Company or organization name is required.");
      return;
    }
    if (!period.trim()) {
      setValidationError("Time period or duration is required.");
      return;
    }

    onSave({
      role: role.trim(),
      company: company.trim(),
      period: period.trim(),
      location: location.trim(),
      description: description.trim(),
      skills_used: skillsUsed,
      order: Number(order) || 1,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-modal-title"
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col">
        <TerminalBox
          title={experience ? "edit_experience.sh" : "new_experience.sh"}
          className="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-zinc-800 flex flex-col overflow-hidden"
          actions={
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-zinc-400 hover:text-zinc-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 font-mono text-xs overflow-y-auto max-h-[75vh]"
          >
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 id="experience-modal-title" className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-terminal-green" />
                  {experience ? "Edit Career Milestone" : "Add Career Milestone"}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Record work timeline entries, roles, responsibilities, and technologies used.
                </p>
              </div>
            </div>

            {validationError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300">
                [ERROR] {validationError}
              </div>
            )}

            {/* Role & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="exp-role" className="block text-zinc-300 font-medium">
                  Role / Position Title *
                </label>
                <input
                  id="exp-role"
                  type="text"
                  required
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-company" className="block text-zinc-300 font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  Company / Organization *
                </label>
                <input
                  id="exp-company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="e.g. Freelance / Tech Labs"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Period, Location & Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="exp-period" className="block text-zinc-300 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Period / Dates *
                </label>
                <input
                  id="exp-period"
                  type="text"
                  required
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="e.g. 2024 - Present"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-location" className="block text-zinc-300 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  Location
                </label>
                <input
                  id="exp-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / India"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-order" className="block text-zinc-300 font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-zinc-400" />
                  Sort Order
                </label>
                <input
                  id="exp-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="exp-description" className="block text-zinc-300 font-medium">
                Description &amp; Key Responsibilities
              </label>
              <textarea
                id="exp-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of contributions, key achievements, system architecture decisions..."
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green p-2.5 text-zinc-100 font-mono focus:outline-none resize-y"
              />
            </div>

            {/* Key Skills Used */}
            <div className="space-y-2">
              <label htmlFor="skill-tag-input" className="block text-zinc-300 font-medium">
                Key Skills &amp; Tech Utilized
              </label>
              <div className="flex gap-2">
                <input
                  id="skill-tag-input"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                  placeholder="Type a skill and press Enter (e.g. React, Docker)"
                  className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                />
                <BrutalButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSkill}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </BrutalButton>
              </div>

              {skillsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skillsUsed.map((sk) => (
                    <TagBadge
                      key={sk}
                      variant="terminal"
                      size="sm"
                      onRemove={() => handleRemoveSkill(sk)}
                    >
                      {sk}
                    </TagBadge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2.5">
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
                {saving ? "Saving..." : experience ? "Update Milestone" : "Add Milestone"}
              </BrutalButton>
            </div>
          </form>
        </TerminalBox>
      </div>
    </div>
  );
}

ExperienceEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  experience: PropTypes.shape({
    id: PropTypes.string,
    role: PropTypes.string,
    company: PropTypes.string,
    period: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    skills_used: PropTypes.arrayOf(PropTypes.string),
    order: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};
