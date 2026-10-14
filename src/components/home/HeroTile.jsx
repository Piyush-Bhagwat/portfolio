import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FolderKanban, BookOpen, Mail } from "lucide-react";
import { BrutalButton } from "../brutalist";
import { DEFAULT_PROFILE } from "../../pages/admin/ProfileCMS.jsx";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";

/**
 * HeroTile - Bento Tile 1 (Hero - 2x2)
 * Terminal window `$ whoami` with dynamic name, role, bio from Firestore,
 * and high-contrast Neo-Brutalist CTA buttons.
 */
export default function HeroTile({ profile = DEFAULT_PROFILE, className = "" }) {
  const name = profile?.name || DEFAULT_PROFILE.name;
  const role = profile?.role || DEFAULT_PROFILE.role;
  const tagline = profile?.tagline || DEFAULT_PROFILE.tagline;
  const bioList =
    Array.isArray(profile?.bio_paragraphs) && profile.bio_paragraphs.length > 0
      ? profile.bio_paragraphs
      : DEFAULT_PROFILE.bio_paragraphs;
  const avatarUrl = profile?.avatar_url || DEFAULT_PROFILE.avatar_url;

  return (
    <div
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-brutal
        flex flex-col justify-between font-mono relative overflow-hidden group
        hover:border-zinc-700 hover:-translate-y-0.5 transition-all ${className}
      `}
    >
      {/* Background terminal watermark accent */}
      <div className="absolute right-3 -bottom-6 text-zinc-900/40 text-8xl font-black select-none pointer-events-none font-mono">
        &gt;_
      </div>

      <div className="space-y-5 sm:space-y-8 relative z-10">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 text-xs text-zinc-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-pulse" />
            <span className="text-zinc-500 font-mono">user@portfolio:~$</span>
            <span className="text-terminal-green font-bold">whoami</span>
          </div>
          <span className="text-[10px] sm:text-xs text-terminal-cyan bg-zinc-900 px-2 py-0.5 border border-zinc-800">
            sys.v2.active
          </span>
        </div>

        {/* Profile Identity & Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {avatarUrl && (
            <div className="relative shrink-0">
              <img
                src={getOptimizedImageUrl(avatarUrl, { width: 400, height: 400, crop: "fill" })}
                alt={name}
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 object-cover border-2 border-zinc-700 shadow-brutal bg-zinc-900"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PROFILE.avatar_url;
                }}
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-terminal-green border-2 border-zinc-950 rounded-full shadow-xs" />
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-xs text-terminal-cyan uppercase tracking-wider font-bold">
              Engineering Profile
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
              {name}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-terminal-green font-bold tracking-wide">
              {role}
            </p>
          </div>
        </div>

        {/* Tagline & Bio Description */}
        <div className="space-y-3.5">
          {tagline && (
            <p className="text-base sm:text-lg font-bold text-zinc-200 border-l-2 border-terminal-green pl-3.5 leading-snug">
              {tagline}
            </p>
          )}
          <div className="space-y-2.5 text-xs sm:text-sm md:text-[15px] text-zinc-400 font-sans leading-relaxed">
            {bioList.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Action Buttons */}
      <div className="pt-5 mt-5 sm:pt-6 sm:mt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-2.5 sm:gap-3 relative z-10">
        <Link to="/projects">
          <BrutalButton
            variant="primary"
            size="sm"
            icon={<FolderKanban className="w-4 h-4" />}
          >
            Explore Projects
          </BrutalButton>
        </Link>
        <Link to="/blogs">
          <BrutalButton
            variant="outline"
            size="sm"
            icon={<BookOpen className="w-4 h-4 text-terminal-cyan" />}
          >
            Read Articles
          </BrutalButton>
        </Link>
        <a href="mailto:piyushbhagwat5@gmail.com?subject=Portfolio Inquiry">
          <BrutalButton
            variant="secondary"
            size="sm"
            icon={<Mail className="w-4 h-4 text-terminal-green" />}
          >
            Say Hello
          </BrutalButton>
        </a>
      </div>
    </div>
  );
}

HeroTile.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    tagline: PropTypes.string,
    bio_paragraphs: PropTypes.arrayOf(PropTypes.string),
    avatar_url: PropTypes.string,
  }),
  className: PropTypes.string,
};
