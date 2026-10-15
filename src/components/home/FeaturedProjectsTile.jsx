import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FolderKanban, ArrowRight, ExternalLink, GitBranch, BookOpen, Star } from "lucide-react";
import { TagBadge, BrutalButton } from "../brutalist";
import { DEFAULT_PROJECTS } from "../../pages/admin/ProjectsCMS.jsx";

/**
 * FeaturedProjectsTile - Bento Tile 6 (Featured Projects Spotlight - 3x2 / Wide)
 * Interactive spotlight cards for top engineered projects with instant case study access.
 */
export default function FeaturedProjectsTile({
  projects = DEFAULT_PROJECTS,
  onOpenCaseStudy,
  className = "",
}) {
  const projectList =
    Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;

  // Filter top 3 featured projects
  const featured = projectList.filter((p) => Boolean(p.featured)).slice(0, 3);
  const displayProjects = featured.length > 0 ? featured : projectList.slice(0, 3);

  return (
    <div
      className={`
        border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-brutal-forest dark:shadow-brutal
        flex flex-col justify-between font-mono hover:border-emerald-700 dark:hover:border-zinc-700
        transition-colors ${className}
      `}
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cbdad0] dark:border-zinc-800/80 pb-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-terminal-green animate-pulse" />
            <FolderKanban className="w-4 h-4 text-emerald-700 dark:text-terminal-green" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f1a14] dark:text-zinc-100">
              Featured Systems &amp; Deployments
            </span>
          </div>
          <Link
            to="/projects"
            className="text-teal-700 dark:text-terminal-cyan hover:underline inline-flex items-center gap-1 text-xs self-start sm:self-auto"
          >
            <span>Browse All {`${projectList.length} Projects`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Spotlight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayProjects.map((project) => {
            const hasCaseStudy = Boolean(
              project.case_study &&
                (project.case_study.why ||
                  (Array.isArray(project.case_study.problems) &&
                    project.case_study.problems.length > 0))
            );

            return (
              <div
                key={project.id || project.slug}
                className="border-2 border-[#cbdad0] dark:border-zinc-800/80 bg-[#f4f7f4] dark:bg-zinc-900/50 p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-600 dark:hover:border-terminal-green hover:-translate-y-0.5 hover:shadow-brutal transition-all shadow-brutal-forest dark:shadow-brutal-sm group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-black px-1.5 py-0.5 font-bold uppercase">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>Featured</span>
                    </span>
                    {project.date && (
                      <span className="text-[#4b5e53] dark:text-zinc-500 font-mono">
                        {project.date}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0f1a14] dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-terminal-green transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {project.description || project.disc}
                    </p>
                  </div>

                  {/* Tags */}
                  {Array.isArray(project.tags) && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <TagBadge key={tag} label={tag} variant="default">
                          {tag}
                        </TagBadge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 mt-3 border-t border-[#cbdad0] dark:border-zinc-800/70 flex items-center justify-between gap-2 text-xs">
                  {hasCaseStudy && onOpenCaseStudy ? (
                    <button
                      type="button"
                      onClick={() => onOpenCaseStudy(project)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-terminal-cyan hover:underline active:translate-x-[1px] active:translate-y-[1px] transition-transform"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Case Study</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#4b5e53] dark:text-zinc-600">Production</span>
                  )}

                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:text-[#0f1a14] dark:hover:text-zinc-100 text-[#4b5e53] dark:text-zinc-500 hover:scale-110 active:scale-95 transition-transform"
                        title="GitHub Repo"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {(project.live_url || project.link) && (
                      <a
                        href={project.live_url || project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-700 dark:text-terminal-green hover:text-emerald-800 dark:hover:text-emerald-300 hover:scale-110 active:scale-95 transition-transform"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-6 border-t border-[#cbdad0] dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4b5e53] dark:text-zinc-400">
        <span>Ready to inspect the source architecture?</span>
        <Link to="/projects">
          <BrutalButton
            variant="outline"
            size="sm"
            icon={<FolderKanban className="w-3.5 h-3.5" />}
          >
            Explore All Projects
          </BrutalButton>
        </Link>
      </div>
    </div>
  );
}

FeaturedProjectsTile.propTypes = {
  projects: PropTypes.array,
  onOpenCaseStudy: PropTypes.func,
  className: PropTypes.string,
};
