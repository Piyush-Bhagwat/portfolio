import PropTypes from "prop-types";
import {
  GitBranch,
  FileText,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { DEFAULT_PROFILE } from "../../pages/admin/ProfileCMS.jsx";

function XIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 0 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

/**
 * SocialsTile - Bento Tile 3 (Socials & Links - 1x1)
 * Monospace link dock with GitHub, LinkedIn, X, and Resume download.
 */
export default function SocialsTile({ profile = DEFAULT_PROFILE, className = "" }) {
  const socials = Array.isArray(profile?.socials) ? profile.socials : DEFAULT_PROFILE.socials;

  const githubUrl =
    socials.find((s) => s.platform === "github")?.url ||
    "https://github.com/Piyush-Bhagwat";
  const linkedinUrl =
    socials.find((s) => s.platform === "linkedin")?.url ||
    "https://www.linkedin.com/in/piyush-bhagwat-1502b4250/";
  const xUrl =
    socials.find((s) => s.platform === "x")?.url || "https://x.com";
  const resumeUrl =
    profile?.resume_url || DEFAULT_PROFILE.resume_url;

  return (
    <div
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-brutal-sm
        flex flex-col justify-between font-mono hover:border-terminal-cyan
        transition-colors ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 text-xs select-none">
        <div className="flex items-center gap-1.5 text-terminal-cyan">
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Links &amp; Dock
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
          CHANNELS
        </span>
      </div>

      {/* Dock Links Grid */}
      <div className="grid grid-cols-2 gap-2 my-2">
        {/* GitHub */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-terminal-green text-zinc-300 hover:text-terminal-green shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
        >
          <GitBranch className="w-4 h-4 text-terminal-green shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold truncate">GitHub</span>
        </a>

        {/* LinkedIn */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-terminal-cyan text-zinc-300 hover:text-terminal-cyan shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
        >
          <LinkedInIcon className="w-4 h-4 text-terminal-cyan shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold truncate">LinkedIn</span>
        </a>

        {/* X / Twitter */}
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
        >
          <XIcon className="w-4 h-4 text-zinc-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold truncate">X / Twitter</span>
        </a>

        {/* Resume Download */}
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400 text-zinc-300 hover:text-amber-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
        >
          <FileText className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold truncate">Resume</span>
        </a>
      </div>

      {/* Dock Footer */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Verified Accounts</span>
        <ExternalLink className="w-3 h-3 text-zinc-600" />
      </div>
    </div>
  );
}

SocialsTile.propTypes = {
  profile: PropTypes.shape({
    socials: PropTypes.arrayOf(
      PropTypes.shape({
        platform: PropTypes.string,
        label: PropTypes.string,
        url: PropTypes.string,
      })
    ),
    resume_url: PropTypes.string,
  }),
  className: PropTypes.string,
};
