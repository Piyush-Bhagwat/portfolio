import { useState } from "react";
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
  Sparkles,
  Database,
  AlertCircle,
} from "lucide-react";
import { seedAllData } from "../../scripts/seedData.js";

/**
 * Admin Overview Page
 * Dashboard home providing quick operational metrics, diagnostic health,
 * quick-action shortcuts across portfolio modules, and database seeding utilities.
 */
export default function Overview() {
  const { user, adminEmail } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const handleSeed = async () => {
    if (!window.confirm("Initialize or seed Firestore with canonical profile, skills, and experience data?")) return;
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedAllData({ overwrite });
      setSeedResult(res);
    } catch (err) {
      setSeedResult({
        success: false,
        error: err.message || "Failed to execute seeder.",
      });
    } finally {
      setSeeding(false);
    }
  };

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

        {/* Module 3: Skills & Timeline */}
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
              <TagBadge variant="terminal" size="sm">Day 3</TagBadge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Organize frontend, backend, database skills and career milestones dynamically.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800/80 mt-4 flex gap-2">
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
              <span className="p-2 bg-zinc-800 border border-zinc-700 inline-block text-rose-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <TagBadge variant="default" size="sm">Day 5</TagBadge>
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
        <div className="lg:col-span-2 space-y-4">
          <TerminalBox title="system-telemetry.log" copyText="npm run dev">
            <div className="space-y-2 text-xs font-mono">
              <div className="text-zinc-500"># System Infrastructure Status Check</div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
                <span className="text-zinc-400">Firebase Auth:</span>
                <span className="text-terminal-green font-semibold">Active &amp; Whitelisted</span>
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
                [OK] V2 Platform foundation verified. Day 3 CMS operational. Ready for Day 4 Projects.
              </div>
            </div>
          </TerminalBox>

          {/* Database Initial Seeder Box (Slice 3.4) */}
          <TerminalBox title="seed_database.sh" className="border-zinc-800">
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <Database className="w-4 h-4 text-terminal-green" />
                    <span>Firestore Initial Data Seeder</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Seed initial V1 bio, skills stack, and career milestones to Firestore if empty.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overwrite}
                      onChange={(e) => setOverwrite(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-none text-terminal-green bg-zinc-900 border-zinc-700"
                    />
                    <span>Force Overwrite</span>
                  </label>
                  <BrutalButton
                    variant="terminal"
                    size="sm"
                    onClick={handleSeed}
                    loading={seeding}
                    disabled={seeding}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    {seeding ? "Seeding..." : "Seed Initial Data"}
                  </BrutalButton>
                </div>
              </div>

              {seedResult && (
                <div
                  className={`p-3 border text-xs space-y-1.5 ${
                    seedResult.success
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                      : "bg-rose-950/40 border-rose-800 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {seedResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {seedResult.success
                        ? "Database Seeder Execution Completed"
                        : "Seeder Encountered Issues"}
                    </span>
                  </div>
                  {seedResult.profile && (
                    <div className="text-[11px] text-zinc-300">
                      • Profile: <span className="font-semibold">{seedResult.profile.status}</span> - {seedResult.profile.message}
                    </div>
                  )}
                  {seedResult.skills && (
                    <div className="text-[11px] text-zinc-300">
                      • Skills: <span className="font-semibold">{seedResult.skills.status}</span> - {seedResult.skills.message}
                    </div>
                  )}
                  {seedResult.experiences && (
                    <div className="text-[11px] text-zinc-300">
                      • Experiences: <span className="font-semibold">{seedResult.experiences.status}</span> - {seedResult.experiences.message}
                    </div>
                  )}
                  {seedResult.projects && (
                    <div className="text-[11px] text-zinc-300">
                      • Projects: <span className="font-semibold">{seedResult.projects.status}</span> - {seedResult.projects.message}
                    </div>
                  )}
                  {seedResult.error && (
                    <div className="text-[11px] text-rose-400 font-semibold">
                      [Error] {seedResult.error}
                    </div>
                  )}
                </div>
              )}
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
            <TagBadge variant="terminal" size="sm">Day 3 Done</TagBadge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-300">Day 1: Tokens &amp; Media</span>
              <span className="text-terminal-green font-bold">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-300">Day 2: Auth &amp; Admin Shell</span>
              <span className="text-terminal-green font-bold">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-100 font-bold">Day 3: Profile &amp; Skills CMS</span>
              <span className="text-terminal-green font-bold">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-200 font-bold">Day 4: Projects &amp; Cases</span>
              <span className="text-terminal-cyan font-bold">ACTIVE</span>
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
              <span>Day 7: Bento Redesign &amp; SEO</span>
              <span>QUEUED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

