import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Terminal, FolderKanban } from "lucide-react";
import { BrutalButton } from "../brutalist";

/**
 * PublicFooter - High-contrast Neo-Brutalist footer with quick contact & CTA
 */
export default function PublicFooter() {
  return (
    <footer className="border-t-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-950 font-mono text-[#4b5e53] dark:text-zinc-400 text-xs transition-colors">
      {/* Top CTA Banner */}
      <div className="border-b-2 border-[#1b2e23] dark:border-zinc-800 py-10 px-4 sm:px-6 lg:px-8 bg-[#e9f0ea] dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-emerald-700 dark:text-terminal-green text-xs font-bold uppercase tracking-wider">
              Ready to Collaborate
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f1a14] dark:text-zinc-100 tracking-tight">
              Have any project in mind? Let&apos;s build.
            </h2>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-sans max-w-lg">
              Open to high-impact software engineering roles, distributed system challenges, and custom UI design systems.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a href="mailto:piyushbhagwat5@gmail.com?subject=Project Inquiry">
              <BrutalButton
                variant="primary"
                size="md"
                icon={<Mail className="w-4 h-4" />}
              >
                Say Hello
              </BrutalButton>
            </a>
            <Link to="/projects">
              <BrutalButton
                variant="outline"
                size="md"
                icon={<FolderKanban className="w-4 h-4" />}
              >
                View Portfolio
              </BrutalButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#cbdad0] dark:border-zinc-900">
        {/* Email */}
        <a
          href="mailto:piyushbhagwat5@gmail.com"
          className="p-4 bg-white dark:bg-zinc-900/60 border border-[#1b2e23] dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-terminal-green text-[#0f1a14] dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-terminal-green transition-all flex items-center gap-3 group shadow-brutal-sm"
        >
          <div className="w-8 h-8 bg-[#f4f7f4] dark:bg-zinc-950 border border-[#1b2e23] dark:border-zinc-800 flex items-center justify-center text-emerald-700 dark:text-terminal-green shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 uppercase block font-bold">Email</span>
            <span className="truncate block font-bold text-xs">piyushbhagwat5@gmail.com</span>
          </div>
        </a>

        {/* Phone */}
        <a
          href="tel:+919309986144"
          className="p-4 bg-white dark:bg-zinc-900/60 border border-[#1b2e23] dark:border-zinc-800 hover:border-cyan-600 dark:hover:border-terminal-cyan text-[#0f1a14] dark:text-zinc-300 hover:text-cyan-700 dark:hover:text-terminal-cyan transition-all flex items-center gap-3 group shadow-brutal-sm"
        >
          <div className="w-8 h-8 bg-[#f4f7f4] dark:bg-zinc-950 border border-[#1b2e23] dark:border-zinc-800 flex items-center justify-center text-cyan-600 dark:text-terminal-cyan shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 uppercase block font-bold">Phone</span>
            <span className="font-bold text-xs">+91 93099861442</span>
          </div>
        </a>

        {/* Location */}
        <div className="p-4 bg-white dark:bg-zinc-900/60 border border-[#1b2e23] dark:border-zinc-800 flex items-center gap-3 shadow-brutal-sm">
          <div className="w-8 h-8 bg-[#f4f7f4] dark:bg-zinc-950 border border-[#1b2e23] dark:border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 uppercase block font-bold">Location</span>
            <span className="font-bold text-xs">Brahmapuri, Maharashtra, India</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#6e8276] dark:text-zinc-500 text-[11px]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
          <span>© 2026 Piyush Bhagwat. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-[#0f1a14] dark:hover:text-zinc-300">Home</Link>
          <Link to="/projects" className="hover:text-[#0f1a14] dark:hover:text-zinc-300">Projects</Link>
          <Link to="/blogs" className="hover:text-[#0f1a14] dark:hover:text-zinc-300">Articles</Link>
          <Link to="/admin" className="hover:text-cyan-700 dark:hover:text-terminal-cyan">Admin CMS</Link>
        </div>
      </div>
    </footer>
  );
}
