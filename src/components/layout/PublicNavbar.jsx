import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Mail } from "lucide-react";
import { BrutalButton, ThemeToggle } from "../brutalist";

/**
 * PublicNavbar - Responsive Neo-Brutalist navigation header
 */
export default function PublicNavbar() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Projects", path: "/projects" },
    { label: "Articles", path: "/blogs" },
    { label: "🛡️ Admin CMS", path: "/admin", accent: "text-cyan-700 dark:text-terminal-cyan" },
  ];

  return (
    <header className="border-b-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4]/95 dark:bg-zinc-950/95 sticky top-0 z-40 backdrop-blur-md select-none font-mono transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#0f1a14] dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-terminal-green transition-colors group"
        >
          <div className="w-8 h-8 bg-white dark:bg-zinc-900 border-2 border-[#1b2e23] dark:border-zinc-800 group-hover:border-emerald-600 dark:group-hover:border-terminal-green flex items-center justify-center font-black text-emerald-700 dark:text-terminal-green shadow-brutal-sm text-sm">
            PB
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-tight text-[#0f1a14] dark:text-zinc-100">
              piyush.bhagwat
            </span>
            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-terminal-green animate-pulse" />
              <span>v2.production</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs">
          {navLinks.map(({ label, path, accent }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`
                  transition-colors py-1 relative font-bold
                  ${accent || (isActive ? "text-emerald-700 dark:text-terminal-green" : "text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100")}
                `}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-terminal-green shadow-[0px_0px_6px_rgba(5,150,105,0.8)] dark:shadow-[0px_0px_6px_rgba(16,185,129,0.9)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA, Theme Toggle & Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle size="sm" />

          <a
            href="mailto:piyushbhagwat5@gmail.com?subject=Website Inquiry"
            className="hidden sm:inline-block"
          >
            <BrutalButton
              variant="outline"
              size="sm"
              icon={<Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />}
            >
              Contact Me
            </BrutalButton>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden p-2 bg-white dark:bg-zinc-900 border border-[#1b2e23] dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-terminal-green text-[#0f1a14] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100"
            aria-label={navOpen ? "Close menu" : "Open menu"}
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {navOpen && (
        <div className="md:hidden border-t-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-950 p-4 space-y-3 font-mono text-xs animate-in slide-in-from-top-2 duration-150">
          <ul className="space-y-1">
            {navLinks.map(({ label, path, accent }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setNavOpen(false)}
                  className={`
                    block px-3 py-2 border border-transparent hover:border-[#1b2e23] dark:hover:border-zinc-800 hover:bg-[#e9f0ea] dark:hover:bg-zinc-900 transition-colors
                    ${accent || "text-[#0f1a14] dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-terminal-green font-bold"}
                  `}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-[#cbdad0] dark:border-zinc-900 flex items-center justify-between gap-3">
            <div className="flex-1">
              <a
                href="mailto:piyushbhagwat5@gmail.com?subject=Website Inquiry"
                className="block"
              >
                <BrutalButton variant="primary" size="sm" fullWidth>
                  Say Hello
                </BrutalButton>
              </a>
            </div>
            <ThemeToggle size="sm" showLabel />
          </div>
        </div>
      )}
    </header>
  );
}
