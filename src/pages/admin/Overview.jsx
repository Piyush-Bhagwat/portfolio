import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { BentoCard, BrutalButton, TagBadge, TerminalBox, StatusPill } from "../../components/brutalist";
import {
  User,
  FolderKanban,
  Wrench,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

/**
 * Admin Overview Page
 * Dashboard home providing quick operational metrics, diagnostic health,
 * and quick-action shortcuts across portfolio modules.
 */
export default function Overview() {
  const { user, adminEmail } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-green mb-1">
            <span>$</span>
            <span>sys.status --admin --verbose</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-zinc-100">
            Control Center
          </h1>
          <p className="text-sm font-mono text-zinc-400 mt-1">
            Welcome back, <span className="text-zinc-200 font-semibold">{user?.email || adminEmail}</span>.
            Manage all portfolio content, technical publications, and case studies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill status="ALL SYSTEMS OPERATIONAL" variant="available" />
        </div>
      </div>

      {/* Bento Stats & Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Profile */}
        <BentoCard
          title="Profile & Bio"
          subtitle="Site configuration & socials"
          dotPattern
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-zinc-800 border border-zinc-700 inline-block text-terminal-green">
                <User className="w-5 h-5" />
              </span>
              <TagBadge variant="terminal" size="sm">Day 3</TagBadge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Manage personal headline, multi-paragraph bio, location, and Cloudinary avatar.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800/80 mt-4">
            <Link to="/admin/profile">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Edit Profile
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>

        {/* Module 2: Projects */}
        <BentoCard
          title="Projects & Cases"
          subtitle="Structured case studies"
          dotPattern
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-zinc-800 border border-zinc-700 inline-block text-terminal-cyan">
                <FolderKanban className="w-5 h-5" />
              </span>
              <TagBadge variant="cyan" size="sm">Day 4</TagBadge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Full CRUD on projects with technical rationale, problem solving Q&A, and media.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800/80 mt-4">
            <Link to="/admin/projects">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Manage Projects
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>

        {/* Module 3: Skills */}
        <BentoCard
          title="Skills & Timeline"
          subtitle="Categorized stack & milestones"
          dotPattern
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-zinc-800 border border-zinc-700 inline-block text-amber-400">
                <Wrench className="w-5 h-5" />
              </span>
              <TagBadge variant="default" size="sm">Day 3</TagBadge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Organize frontend, backend, database skills and career milestones dynamically.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800/80 mt-4">
            <Link to="/admin/skills">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Manage Stack
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>

        {/* Module 4: Blogs */}
        <BentoCard
          title="Technical Articles"
          subtitle="Split markdown & media"
          dotPattern
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-zinc-800 border border-zinc-700 inline-block text-rose-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <TagBadge variant="terminal" size="sm">Day 5</TagBadge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Split-pane markdown editor with Cloudinary asset drop and automatic reading time.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800/80 mt-4">
            <Link to="/admin/blogs">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Author Posts
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Diagnostic & Telemetry Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telemetry Terminal */}
        <div className="lg:col-span-2">
          <TerminalBox title="system-telemetry.log" copyText="npm run dev">
            <div className="space-y-2 text-xs font-mono">
              <div className="text-zinc-500"># System Infrastructure Status Check</div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                <span className="text-zinc-400">Firebase Auth:</span>
                <span className="text-terminal-green font-semibold">Active & Whitelisted</span>
                <span className="text-zinc-600">({adminEmail})</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                <span className="text-zinc-400">Cloud Firestore:</span>
                <span className="text-terminal-green font-semibold">Ready</span>
                <span className="text-zinc-600">(portfolio-c6f29)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                <span className="text-zinc-400">Cloudinary Media CDN:</span>
                <span className="text-terminal-green font-semibold">Configured</span>
                <span className="text-zinc-600">(portfolio_unsigned)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                <span className="text-zinc-400">Route Session Guard:</span>
                <span className="text-terminal-green font-semibold">Enforced via ProtectedRoute</span>
              </div>
              <div className="pt-2 text-[11px] text-zinc-500 border-t border-zinc-800">
                [OK] V2 Platform foundation verified. Proceeding to Day 3 CMS modules.
              </div>
            </div>
          </TerminalBox>
        </div>

        {/* 7-Day Sprint Roadmap Progress */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 font-mono space-y-4 shadow-brutal">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-terminal-green" />
              SPRINT STATUS
            </span>
            <TagBadge variant="terminal" size="sm">Day 2</TagBadge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-300">Day 1: Tokens & Media</span>
              <span className="text-terminal-green font-bold">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-100 font-bold">Day 2: Auth & Admin Shell</span>
              <span className="text-terminal-cyan font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Day 3: Profile & Skills CMS</span>
              <span>QUEUED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Day 4: Projects & Cases</span>
              <span>QUEUED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Day 5: Blog Engine CMS</span>
              <span>QUEUED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Day 6: Public Readers</span>
              <span>QUEUED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Day 7: Bento Redesign & SEO</span>
              <span>QUEUED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
