import PropTypes from "prop-types";
import { ExternalLink, GitBranch, BookOpen, Star, Terminal } from "lucide-react";
import { TagBadge, BrutalButton } from "../brutalist";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";

/**
 * ProjectCard - Neo-Brutalist Project Card with interactive
 * "Read Case Study" drawer trigger, live links, and tech badges.
 */
export default function ProjectCard({
  project,
  featured = false,
  onOpenCaseStudy,
  onTagClick,
}) {
  if (!project) return null;

  const title = project.title || "Untitled Project";
  const description = project.description || project.disc || "";
  const imageUrl = project.image_url || project.img || "";
  const liveUrl = project.live_url || project.link || "";
  const githubUrl = project.github_url || "";
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const date = project.date || "";

  // Check if case study has content
  const hasCaseStudy = Boolean(
    project.case_study &&
      (project.case_study.why ||
        (Array.isArray(project.case_study.problems) &&
          project.case_study.problems.length > 0) ||
        (Array.isArray(project.case_study.learnings) &&
          project.case_study.learnings.length > 0))
  );

  return (
    <article
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between
        transition-all duration-150 relative group
        ${
          featured
            ? "shadow-brutal hover:border-terminal-green md:col-span-2"
            : "shadow-brutal-sm hover:border-zinc-600"
        }
      `}
    >
      <div className="space-y-4">
        {/* Cover Image or Terminal Monospace Placeholder */}
        <div className="relative border-2 border-zinc-800 bg-zinc-900 overflow-hidden aspect-video sm:aspect-[2/1] flex items-center justify-center">
          {imageUrl ? (
            <img
              src={getOptimizedImageUrl(imageUrl, { width: 800 })}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full p-4 flex flex-col justify-between font-mono text-zinc-500 bg-zinc-900 select-none">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-terminal-cyan">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>sys.preview.exec</span>
                </div>
                <span className="text-[10px] text-zinc-600">{date || "v2.0"}</span>
              </div>
              <div className="text-center py-2">
                <span className="text-sm font-bold text-zinc-300 block line-clamp-1">
                  {title}
                </span>
                <span className="text-[10px] text-zinc-500 tracking-wider">
                  SOURCE ARCHITECTURE
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-600 border-t border-zinc-800 pt-1">
                <span>DEPLOY: OK</span>
                <span className="text-terminal-green font-bold">LIVE APPS</span>
              </div>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {project.featured && (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-black text-[10px] font-bold font-mono px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                <Star className="w-3 h-3 fill-black text-black" />
                <span>Featured</span>
              </span>
            )}
            {hasCaseStudy && (
              <span className="inline-flex items-center gap-1 bg-terminal-cyan text-black text-[10px] font-bold font-mono px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                <BookOpen className="w-3 h-3" />
                <span>Case Study</span>
              </span>
            )}
          </div>
        </div>

        {/* Project Header & Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold font-mono text-zinc-100 group-hover:text-terminal-green transition-colors leading-snug">
              {title}
            </h3>
            {date && (
              <span className="text-[11px] font-mono text-zinc-500 shrink-0 border border-zinc-800 px-2 py-0.5 bg-zinc-900">
                {date}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-sans line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <TagBadge
                key={tag}
                label={tag}
                variant="default"
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
                className={onTagClick ? "cursor-pointer hover:border-terminal-cyan" : ""}
              >
                {tag}
              </TagBadge>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls Footer */}
      <div className="pt-5 mt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {hasCaseStudy && onOpenCaseStudy && (
            <BrutalButton
              variant="outline"
              size="sm"
              onClick={() => onOpenCaseStudy(project)}
              icon={<BookOpen className="w-3.5 h-3.5 text-terminal-cyan" />}
            >
              Read Case Study
            </BrutalButton>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="View Source Code on GitHub"
              aria-label="View Source Code on GitHub"
            >
              <GitBranch className="w-4 h-4 text-terminal-cyan" />
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-terminal-green hover:text-black text-zinc-200 border border-zinc-700 font-bold transition-colors"
            >
              <span>Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    disc: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    live_url: PropTypes.string,
    link: PropTypes.string,
    github_url: PropTypes.string,
    image_url: PropTypes.string,
    img: PropTypes.string,
    date: PropTypes.string,
    featured: PropTypes.bool,
    case_study: PropTypes.object,
  }).isRequired,
  featured: PropTypes.bool,
  onOpenCaseStudy: PropTypes.func,
  onTagClick: PropTypes.func,
};
