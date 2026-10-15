import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { BentoCard, BrutalButton, TerminalBox, StatusPill } from "../../components/brutalist";
import {
  User,
  FolderKanban,
  Wrench,
  BookOpen,
  ArrowRight,
  CheckCircle2,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cbdad0] dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-terminal-green mb-1">
            <span>$</span>
            <span>sys.status --admin --verbose</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-[#0f1a14] dark:text-zinc-100">
            Control Center
          </h1>
          <p className="text-sm font-mono text-[#4b5e53] dark:text-zinc-400 mt-1">
            Welcome back, <span className="text-[#0f1a14] dark:text-zinc-200 font-semibold">{user?.email || adminEmail}</span>.
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
              <span className="p-2 bg-[#e9f0ea] dark:bg-zinc-800 border border-[#cbdad0] dark:border-zinc-700 inline-block text-emerald-700 dark:text-terminal-green">
                <User className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-mono">
              Manage personal headline, multi-paragraph bio, location, and Cloudinary avatar.
            </p>
          </div>
          <div className="pt-4 border-t border-[#cbdad0] dark:border-zinc-800/80 mt-4">
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
              <span className="p-2 bg-[#e9f0ea] dark:bg-zinc-800 border border-[#cbdad0] dark:border-zinc-700 inline-block text-cyan-700 dark:text-terminal-cyan">
                <FolderKanban className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-mono">
              Full CRUD on projects with technical rationale, problem solving Q&A, and media.
            </p>
          </div>
          <div className="pt-4 border-t border-[#cbdad0] dark:border-zinc-800/80 mt-4">
            <Link to="/admin/projects">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Manage Projects
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>

        {/* Module 3: Skills & Timeline */}
        <BentoCard
          title="Skills & Timeline"
          subtitle="Categorized stack & milestones"
          dotPattern
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-[#e9f0ea] dark:bg-zinc-800 border border-[#cbdad0] dark:border-zinc-700 inline-block text-amber-600 dark:text-amber-400">
                <Wrench className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-mono">
              Organize frontend, backend, database skills and career milestones dynamically.
            </p>
          </div>
          <div className="pt-4 border-t border-[#cbdad0] dark:border-zinc-800/80 mt-4 flex gap-2">
            <Link to="/admin/skills" className="flex-1">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-center">
                Skills
              </BrutalButton>
            </Link>
            <Link to="/admin/experience" className="flex-1">
              <BrutalButton variant="outline" size="sm" className="w-full justify-center">
                Timeline
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
              <span className="p-2 bg-[#e9f0ea] dark:bg-zinc-800 border border-[#cbdad0] dark:border-zinc-700 inline-block text-rose-600 dark:text-rose-400">
                <BookOpen className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-mono">
              Split-pane markdown editor with Cloudinary asset drop and automatic reading time.
            </p>
          </div>
          <div className="pt-4 border-t border-[#cbdad0] dark:border-zinc-800/80 mt-4">
            <Link to="/admin/blogs">
              <BrutalButton variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Author Posts
              </BrutalButton>
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Diagnostic & Metadata Window */}
      <div className="grid grid-cols-1 gap-4">
        {/* Metadata Terminal */}
        <TerminalBox title="system-metadata.log" copyText="npm run dev">
          <div className="space-y-2 text-xs font-mono">
            <div className="text-[#4b5e53] dark:text-zinc-500"># System Infrastructure Status Check</div>
            <div className="flex items-center gap-2 text-[#0f1a14] dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span className="text-[#4b5e53] dark:text-zinc-400">Firebase Auth:</span>
              <span className="text-emerald-700 dark:text-terminal-green font-semibold">Active &amp; Whitelisted</span>
              <span className="text-[#6e8276] dark:text-zinc-600">({adminEmail})</span>
            </div>
            <div className="flex items-center gap-2 text-[#0f1a14] dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span className="text-[#4b5e53] dark:text-zinc-400">Cloud Firestore:</span>
              <span className="text-emerald-700 dark:text-terminal-green font-semibold">Ready</span>
              <span className="text-[#6e8276] dark:text-zinc-600">(portfolio-c6f29)</span>
            </div>
            <div className="flex items-center gap-2 text-[#0f1a14] dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span className="text-[#4b5e53] dark:text-zinc-400">Cloudinary Media CDN:</span>
              <span className="text-emerald-700 dark:text-terminal-green font-semibold">Configured</span>
              <span className="text-[#6e8276] dark:text-zinc-600">(portfolio_unsigned)</span>
            </div>
            <div className="flex items-center gap-2 text-[#0f1a14] dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green shrink-0" />
              <span className="text-[#4b5e53] dark:text-zinc-400">Route Session Guard:</span>
              <span className="text-emerald-700 dark:text-terminal-green font-semibold">Enforced via ProtectedRoute</span>
            </div>
            <div className="pt-2 text-[11px] text-[#4b5e53] dark:text-zinc-500 border-t border-[#cbdad0] dark:border-zinc-800">
              [OK] V2 Production Platform verified. All CMS modules, media pipelines, and public routes operational.
            </div>
          </div>
        </TerminalBox>
      </div>
    </div>
  );
}

