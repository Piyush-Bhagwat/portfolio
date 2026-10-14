import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Clock, MapPin, Radio } from "lucide-react";
import { DEFAULT_PROFILE } from "../../pages/admin/ProfileCMS.jsx";

function getISTTime() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return "12:00:00";
  }
}

/**
 * StatusTile - Bento Tile 2 (Status - 1x1)
 * Pulsing status pill, current location, and real-time IST clock.
 */
export default function StatusTile({ profile = DEFAULT_PROFILE, className = "" }) {
  const [currentTime, setCurrentTime] = useState(() => getISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getISTTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const location = profile?.location || DEFAULT_PROFILE.location;
  const statusBadge = profile?.status_badge || "Available for new opportunities";

  return (
    <div
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-brutal-sm
        flex flex-col justify-between font-mono hover:border-terminal-green
        hover:-translate-y-0.5 hover:shadow-brutal transition-all ${className}
      `}
    >
      {/* Tile Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 text-xs select-none">
        <div className="flex items-center gap-1.5 text-terminal-green">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-cyan">
            Metadata
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
          NODE: IST
        </span>
      </div>

      {/* Main Status & Time */}
      <div className="space-y-4 my-2">
        {/* Availability Pill */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
            Availability:
          </span>
          <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-600/60 px-2.5 py-1 text-xs text-terminal-green font-bold">
            <span className="w-2 h-2 rounded-full bg-terminal-green animate-ping shrink-0" />
            <span className="truncate">{statusBadge}</span>
          </div>
        </div>

        {/* Live IST Clock */}
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
            Local Time:
          </span>
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-xl sm:text-2xl tracking-wider">
            <Clock className="w-4 h-4 text-terminal-cyan shrink-0" />
            <span>{`${currentTime} IST`}</span>
          </div>
          <span className="text-[10px] text-zinc-600 block">
            UTC+05:30 • Asia/Kolkata
          </span>
        </div>
      </div>

      {/* Location Footer */}
      <div className="pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs text-zinc-400">
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate text-[11px]">{location}</span>
      </div>
    </div>
  );
}

StatusTile.propTypes = {
  profile: PropTypes.shape({
    location: PropTypes.string,
    status_badge: PropTypes.string,
  }),
  className: PropTypes.string,
};
