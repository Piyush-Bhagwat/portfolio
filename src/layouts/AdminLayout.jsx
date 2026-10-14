import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { StatusPill, BrutalButton } from "../components/brutalist";
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
  },
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

  // Derive current section label for breadcrumb
  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) || {
    label: "Control Panel",
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-zinc-100 flex flex-col antialiased selection:bg-terminal-green selection:text-zinc-950">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        {/* Left: Mobile hamburger + breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 border border-zinc-800 bg-zinc-900 active:bg-zinc-800"
            aria-label="Toggle admin navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Link
              to="/admin/overview"
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 font-bold"
            >
              <Terminal className="w-3.5 h-3.5 text-terminal-green" />
              <span>ADMIN_CMS</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-zinc-300 font-semibold tracking-wide">
              {currentNav.label}
            </span>
          </div>
        </div>

        {/* Right: Status pill, quick public link, admin identity */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <StatusPill status="ADMIN ACTIVE" variant="available" />
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-zinc-400 hover:text-terminal-cyan flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
          >
            <span className="hidden sm:inline">Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-terminal-green" />
            <span className="font-mono text-xs text-zinc-400 truncate max-w-[180px]">
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
            w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between
            transition-transform duration-200 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Sidebar Nav Links */}
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Identity Badge */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 font-mono space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-terminal-green" />
                  AUTHENTICATED
                </span>
                <span className="text-zinc-600">v2.0</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.email || adminEmail}
              </p>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1">
              <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Core Modules
              </p>
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-2.5 font-mono text-xs
                      border border-transparent transition-all
                      ${
                        isActive
                          ? "bg-zinc-900 border-zinc-700 text-terminal-green font-bold shadow-brutal-sm border-r-2 border-r-terminal-green"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
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
          <div className="p-4 border-t border-zinc-800 space-y-3 bg-zinc-950">
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
            <div className="text-center font-mono text-[10px] text-zinc-600">
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
