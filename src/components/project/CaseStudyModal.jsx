import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  ExternalLink,
  GitBranch,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TagBadge, BrutalButton } from "../brutalist";

/**
 * CaseStudyModal - Interactive sliding drawer / modal showcasing
 * project motivations, architectural decisions, and expandable challenge accordions.
 */
export default function CaseStudyModal({ project, onClose }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, []);

  if (!project) return null;

  const caseStudy = project.case_study || {};
  const problems = Array.isArray(caseStudy.problems) ? caseStudy.problems : [];
  const techStack =
    Array.isArray(caseStudy.tech_stack) && caseStudy.tech_stack.length > 0
      ? caseStudy.tech_stack
      : project.tags || [];
  const learnings = Array.isArray(caseStudy.learnings) ? caseStudy.learnings : [];

  const toggleProblem = (idx) => {
    setExpandedIndex(expandedIndex === idx ? -1 : idx);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end p-0 sm:p-4 overflow-y-auto"
    >
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-2xl bg-zinc-950 border-l-2 sm:border-2 border-zinc-800 shadow-brutal flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh] my-auto font-mono text-zinc-100 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Terminal Header */}
        <div className="bg-zinc-900 px-4 py-3 border-b-2 border-zinc-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-pulse" />
            <span className="text-xs text-zinc-400">
              sys.casestudy.drawer
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs text-terminal-cyan font-bold truncate max-w-[200px] sm:max-w-[280px]">
              {project.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Close case study drawer (Esc)"
            aria-label="Close case study drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7 flex-1">
          {/* Project Title & Quick Actions */}
          <div className="space-y-3 border-b border-zinc-800 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="case-study-title"
                className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight"
              >
                {project.title}
              </h2>
              {project.date && (
                <span className="text-xs text-zinc-500 border border-zinc-800 px-2.5 py-1 bg-zinc-900">
                  {`Deployed: ${project.date}`}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              {project.description || project.disc}
            </p>

            {/* Live Link & Repo Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {(project.live_url || project.link) && (
                <a
                  href={project.live_url || project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terminal-green text-black font-bold text-xs border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live App</span>
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-terminal-cyan" />
                  <span>View Repository</span>
                </a>
              )}
            </div>
          </div>

          {/* Section 1: Motivation & Context */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terminal-green">
              <Sparkles className="w-4 h-4 text-terminal-cyan" />
              <span>01 // Motivation &amp; Problem Statement</span>
            </div>
            <div className="bg-zinc-900/60 border-l-4 border-terminal-green p-4 text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              {caseStudy.why ? (
                <p className="whitespace-pre-line">{caseStudy.why}</p>
              ) : (
                <p className="text-zinc-500 italic">
                  This project was engineered to solve practical user workflow challenges and test reliable modern web architectures.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Architecture & Tech Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terminal-green">
              <Layers className="w-4 h-4 text-terminal-cyan" />
              <span>02 // Architectural Decisions &amp; Tech Breakdown</span>
            </div>

            {/* Tech Badges */}
            <div className="space-y-2">
              <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">
                Integrated Technology Stack:
              </span>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <TagBadge key={tech} label={tech} variant="cyan" />
                ))}
              </div>
            </div>

            {/* Learnings / Takeaways */}
            {learnings.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">
                  Core Engineering Takeaways:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {learnings.map((learning, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                      <span className="truncate">{learning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Expandable Accordion of Challenges & Solutions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terminal-green">
              <HelpCircle className="w-4 h-4 text-terminal-cyan" />
              <span>03 // Challenges Encountered &amp; Resolutions</span>
            </div>

            {problems.length === 0 ? (
              <div className="p-4 bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500 font-mono">
                No critical architectural blockers or challenges reported for this deployment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {problems.map((prob, idx) => {
                  const isOpen = expandedIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border-2 border-zinc-800 bg-zinc-900/50 shadow-brutal-sm overflow-hidden transition-all"
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => toggleProblem(idx)}
                        className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left hover:bg-zinc-800/60 transition-colors select-none"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 bg-zinc-800 text-terminal-cyan border border-zinc-700 shrink-0">
                            {`Q${idx + 1}`}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-200 leading-snug">
                            {prob.que}
                          </span>
                        </div>
                        <div className="shrink-0 text-zinc-400 mt-0.5">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-terminal-green" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Body */}
                      {isOpen && (
                        <div className="px-4 py-3.5 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-300 font-mono leading-relaxed space-y-2">
                          <div className="flex items-center gap-1.5 text-terminal-green font-bold text-[11px] uppercase tracking-wider">
                            <span>Resolution:</span>
                          </div>
                          <p className="whitespace-pre-line text-zinc-300">
                            {prob.ans}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Drawer Footer */}
        <div className="bg-zinc-900 px-5 py-3.5 border-t-2 border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-500 hidden sm:block">
            <span>Press ESC or click outside to dismiss</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <BrutalButton
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </BrutalButton>
            {(project.live_url || project.link) && (
              <a
                href={project.live_url || project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrutalButton
                  variant="primary"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Live Demo
                </BrutalButton>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CaseStudyModal.propTypes = {
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
    date: PropTypes.string,
    featured: PropTypes.bool,
    case_study: PropTypes.shape({
      why: PropTypes.string,
      tech_stack: PropTypes.arrayOf(PropTypes.string),
      learnings: PropTypes.arrayOf(PropTypes.string),
      problems: PropTypes.arrayOf(
        PropTypes.shape({
          que: PropTypes.string,
          ans: PropTypes.string,
        })
      ),
    }),
  }),
  onClose: PropTypes.func.isRequired,
};
