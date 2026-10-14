import { useState } from "react";
import PropTypes from "prop-types";
import { Code2, Cpu } from "lucide-react";
import { DEFAULT_SKILLS } from "../../pages/admin/SkillsCMS.jsx";

/**
 * SkillsTile - Bento Tile 4 (Tech Stack Marquee / Bento - 2x1)
 * Interactive skill badges loaded dynamically from Firestore skills collection.
 */
export default function SkillsTile({ skills = DEFAULT_SKILLS, className = "" }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const skillList = Array.isArray(skills) && skills.length > 0 ? skills : DEFAULT_SKILLS;

  const categories = [
    { id: "all", label: "All Tech" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
    { id: "database", label: "Database" },
    { id: "tools", label: "Tools" },
  ];

  const filteredSkills =
    selectedCategory === "all"
      ? skillList
      : skillList.filter((s) => s.category?.toLowerCase() === selectedCategory);

  return (
    <div
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-brutal-sm
        flex flex-col justify-between font-mono hover:border-zinc-700
        transition-colors ${className}
      `}
    >
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5 text-xs select-none">
          <div className="flex items-center gap-1.5 text-terminal-green">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-cyan">
              Tech Stack &amp; Skills
            </span>
          </div>

          {/* Category Toggle Pills */}
          <div className="flex items-center gap-1 text-[10px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 border transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  selectedCategory === cat.id
                    ? "bg-terminal-green text-black font-bold border-terminal-green shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Badges Matrix */}
        <div className="flex flex-wrap gap-2 pt-1">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id || skill.name}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-terminal-green text-zinc-200 text-xs transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none select-none cursor-default"
            >
              {skill.icon_url ? (
                <img
                  src={skill.icon_url}
                  alt={skill.name}
                  className="w-4 h-4 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Code2 className="w-3.5 h-3.5 text-terminal-cyan shrink-0" />
              )}
              <span className="font-bold">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{`${skillList.length} Integrated Technologies`}</span>
        <span className="text-terminal-green font-bold">READY TO SCALE</span>
      </div>
    </div>
  );
}

SkillsTile.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      category: PropTypes.string,
      icon_url: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};
