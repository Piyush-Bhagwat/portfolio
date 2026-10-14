import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Mail } from "lucide-react";
import { BrutalButton } from "../brutalist";

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
    { label: "⚡ V2 Primitives", path: "/v2-preview", accent: "text-terminal-green" },
    { label: "🛡️ Admin CMS", path: "/admin", accent: "text-terminal-cyan" },
  ];

  return (
    <header className="border-b-2 border-zinc-800 bg-zinc-950/95 sticky top-0 z-40 backdrop-blur-md select-none font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-zinc-100 hover:text-terminal-green transition-colors group"
        >
          <div className="w-8 h-8 bg-zinc-900 border-2 border-zinc-800 group-hover:border-terminal-green flex items-center justify-center font-black text-terminal-green shadow-brutal-sm text-sm">
            PB
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-tight text-zinc-100">
              piyush.bhagwat
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
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
                  ${accent || (isActive ? "text-terminal-green" : "text-zinc-400 hover:text-zinc-100")}
                `}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-green shadow-[0px_0px_6px_rgba(16,185,129,0.9)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="mailto:piyushbhagwat5@gmail.com?subject=Website Inquiry"
            className="hidden sm:inline-block"
          >
            <BrutalButton
              variant="outline"
              size="sm"
              icon={<Mail className="w-3.5 h-3.5 text-terminal-green" />}
            >
              Contact Me
            </BrutalButton>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden p-2 bg-zinc-900 border border-zinc-800 hover:border-terminal-green text-zinc-400 hover:text-zinc-100"
            aria-label={navOpen ? "Close menu" : "Open menu"}
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {navOpen && (
        <div className="md:hidden border-t-2 border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs animate-in slide-in-from-top-2 duration-150">
          <ul className="space-y-1">
            {navLinks.map(({ label, path, accent }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setNavOpen(false)}
                  className={`
                    block px-3 py-2 border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-colors
                    ${accent || "text-zinc-300 hover:text-terminal-green font-bold"}
                  `}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-zinc-900">
            <a
              href="mailto:piyushbhagwat5@gmail.com?subject=Website Inquiry"
              className="block"
            >
              <BrutalButton variant="primary" size="sm" fullWidth>
                Say Hello
              </BrutalButton>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
