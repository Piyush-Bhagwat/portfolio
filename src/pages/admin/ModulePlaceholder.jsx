import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { TerminalBox, BrutalButton, TagBadge } from "../../components/brutalist";
import { ArrowLeft, Clock } from "lucide-react";

/**
 * ModulePlaceholder
 * Serves as an informative neo-brutalist placeholder for CMS modules
 * scheduled for subsequent days in the 7-day sprint plan.
 */
export default function ModulePlaceholder({ title, day, description }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/overview">
          <BrutalButton variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Overview
          </BrutalButton>
        </Link>
        <TagBadge variant="terminal" size="sm">Scheduled: {day}</TagBadge>
      </div>

      <TerminalBox title={`${title.toLowerCase().replace(/\s+/g, "-")}.sh`}>
        <div className="space-y-4 font-mono text-sm">
          <div className="flex items-center gap-2 text-terminal-green">
            <span>$</span>
            <span>cat {title.toLowerCase().replace(/\s+/g, "_")}_roadmap.md</span>
          </div>

          <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {description || `This module is scheduled for implementation in ${day} of the Portfolio V2 sprint.`}
          </p>

          <div className="p-4 bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">Sprint Status:</span>
            </div>
            <p>
              Day 2 (Auth, Session Guard & Admin Shell) is currently in progress.
              This interface will be populated with full Firestore CRUD forms in {day}.
            </p>
          </div>
        </div>
      </TerminalBox>
    </div>
  );
}

ModulePlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
  description: PropTypes.string,
};
