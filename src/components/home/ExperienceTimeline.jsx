import PropTypes from "prop-types";
import { Briefcase, Building, Calendar, MapPin } from "lucide-react";
import { TagBadge } from "../brutalist";
import { DEFAULT_EXPERIENCES } from "../../pages/admin/ExperienceCMS.jsx";

/**
 * ExperienceTimeline - Public Career Milestones & Work History Section
 * Neo-Brutalist chronological timeline showing roles, companies, dates,
 * descriptions, and key technologies utilized.
 */
export default function ExperienceTimeline({
  experiences = DEFAULT_EXPERIENCES,
  className = "",
}) {
  const milestoneList =
    Array.isArray(experiences) && experiences.length > 0
      ? experiences
      : DEFAULT_EXPERIENCES;

  return (
    <section
      id="experience"
      aria-label="Career Milestones and Work History"
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-brutal
        font-mono hover:border-zinc-700 transition-colors ${className}
      `}
    >
      <div className="space-y-6">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-pulse" />
            <Briefcase className="w-4 h-4 text-terminal-green" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
              Work Experience &amp; Milestones
            </span>
          </div>
          <div className="text-zinc-500 text-xs flex items-center gap-1.5">
            <span className="text-terminal-green">$</span>
            <span>sys.timeline --career</span>
          </div>
        </div>

        {/* Section Intro Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Chronological progression across full-stack engineering, open source contributions,
          and academic computer science milestones.
        </p>

        {/* Timeline Spine & Nodes */}
        <div className="relative pl-6 sm:pl-8 ml-2 sm:ml-4 border-l-2 border-zinc-800 space-y-8 sm:space-y-10 my-4">
          {milestoneList.map((exp, index) => (
            <div key={exp.id || index} className="relative group">
              {/* Timeline Node Bullet */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-terminal-green flex items-center justify-center transition-transform group-hover:scale-125"
                aria-hidden="true"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
              </div>

              {/* Milestone Card */}
              <div className="border border-zinc-800/90 bg-zinc-900/40 p-4 sm:p-6 hover:border-zinc-700 transition-colors shadow-brutal space-y-3.5">
                {/* Header: Role, Company, Location, Period */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 border-b border-zinc-800/80 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                      {exp.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                        <Building className="w-3.5 h-3.5 text-terminal-cyan" />
                        <span>{exp.company}</span>
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span>{exp.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-start sm:self-auto shrink-0">
                    <TagBadge variant="terminal" size="sm">
                      <Calendar className="w-3 h-3 mr-1 inline" />
                      {exp.period}
                    </TagBadge>
                  </div>
                </div>

                {/* Milestone Description */}
                {exp.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {/* Skills Used Tags */}
                {Array.isArray(exp.skills_used) && exp.skills_used.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-800/80 text-xs">
                    <span className="text-[11px] text-zinc-500 font-mono mr-1">Skills:</span>
                    {exp.skills_used.map((skill) => (
                      <TagBadge key={skill} variant="default" size="sm">
                        {skill}
                      </TagBadge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

ExperienceTimeline.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      period: PropTypes.string.isRequired,
      location: PropTypes.string,
      description: PropTypes.string,
      skills_used: PropTypes.arrayOf(PropTypes.string),
      order: PropTypes.number,
    })
  ),
  className: PropTypes.string,
};
