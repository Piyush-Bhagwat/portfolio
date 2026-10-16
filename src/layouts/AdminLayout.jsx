import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { StatusPill, BrutalButton, ThemeToggle } from "../components/brutalist";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Briefcase,
  BookOpen,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Terminal,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
    to: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Profile & Bio",
    to: "/admin/profile",
    icon: User,
  },
  {
    label: "Projects & Cases",
    to: "/admin/projects",
    icon: FolderKanban,
  },
  {
    label: "Skills & Stack",
    to: "/admin/skills",
    icon: Wrench,
  },
  {
    label: "Work Experience",
    to: "/admin/experience",
    icon: Briefcase,
  },
  {
    label: "Technical Blogs",
    to: "/admin/blogs",
    icon: BookOpen,
  }
];

/**
 * Admin Navigation Shell
 * Provides the persistent administrative frame with responsive sidebar,
 * top status bar, and breadcrumb navigation.
 */
export default function AdminLayout() {
  const { user, adminEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Derive current section label for breadcrumb (longest path matches first)
  const currentNav = NAV_ITEMS.slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => location.pathname.startsWith(item.to)) || {
    label: "Control Panel",
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-terminal-bg text-[#0f1a14] dark:text-zinc-100 flex flex-col antialiased selection:bg-emerald-600 dark:selection:bg-terminal-green selection:text-white dark:selection:text-zinc-950 transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#f4f7f4]/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-[#1b2e23] dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        {/* Left: Mobile hamburger + breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#0f1a14] dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-zinc-100 border border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800"
            aria-label="Toggle admin navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Link
              to="/admin/overview"
              className="text-[#4b5e53] dark:text-zinc-500 hover:text-emerald-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5 font-bold"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
              <span>ADMIN_CMS</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[#cbdad0] dark:text-zinc-700" />
            <span className="text-[#0f1a14] dark:text-zinc-300 font-semibold tracking-wide">
              {currentNav.label}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle, Status pill, quick public link, admin identity */}
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />

          <div className="hidden sm:block">
            <StatusPill status="ADMIN ACTIVE" variant="available" />
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[#0f1a14] dark:text-zinc-400 hover:text-cyan-700 dark:hover:text-terminal-cyan flex items-center gap-1.5 px-2.5 py-1.5 border border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-700 transition-colors shadow-brutal-sm"
          >
            <span className="hidden sm:inline">Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#cbdad0] dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-green" />
            <span className="font-mono text-xs text-[#4b5e53] dark:text-zinc-400 truncate max-w-[180px]">
              {user?.email || adminEmail}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed md:sticky top-[53px] left-0 h-[calc(100vh-53px)] z-40
            w-64 bg-white dark:bg-zinc-950 border-r border-[#1b2e23] dark:border-zinc-800 flex flex-col justify-between
            transition-transform duration-200 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Sidebar Nav Links */}
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Identity Badge */}
            <div className="p-3 bg-[#e9f0ea] dark:bg-zinc-900/60 border border-[#1b2e23] dark:border-zinc-800 font-mono space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#4b5e53] dark:text-zinc-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
                  AUTHENTICATED
                </span>
                <span className="text-[#6e8276] dark:text-zinc-600">v2.0</span>
              </div>
              <p className="text-xs font-semibold text-[#0f1a14] dark:text-zinc-200 truncate">
                {user?.email || adminEmail}
              </p>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1">
              <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-[#4b5e53] dark:text-zinc-500 font-bold mb-2">
                Core Modules
              </p>
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isCurrent = item.to === "/admin/blogs"
                  ? (location.pathname === "/admin/blogs" || location.pathname.startsWith("/admin/blogs/new") || location.pathname.startsWith("/admin/blogs/edit"))
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-2.5 font-mono text-xs
                      border border-transparent transition-all
                      ${
                        isCurrent
                          ? "bg-[#e9f0ea] dark:bg-zinc-900 border-[#1b2e23] dark:border-zinc-700 text-emerald-700 dark:text-terminal-green font-bold shadow-brutal-sm border-r-2 border-r-emerald-600 dark:border-r-terminal-green"
                          : "text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 hover:bg-[#e9f0ea]/50 dark:hover:bg-zinc-900/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer with Logout Action */}
          <div className="p-4 border-t border-[#1b2e23] dark:border-zinc-800 space-y-3 bg-[#f4f7f4] dark:bg-zinc-950">
            <BrutalButton
              variant="danger"
              size="sm"
              loading={loggingOut}
              disabled={loggingOut}
              onClick={handleLogout}
              className="w-full justify-center"
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              {loggingOut ? "Signing out..." : "Sign Out"}
            </BrutalButton>
            <div className="text-center font-mono text-[10px] text-[#6e8276] dark:text-zinc-600">
              Portfolio V2 Admin Suite
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
