import PropTypes from "prop-types";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Terminal } from "lucide-react";

/**
 * ProtectedRoute Guard Component
 * Intercepts unauthenticated or unauthorized requests to protected admin routes.
 *
 * Behavior:
 * 1. While authentication is resolving (`loading`), renders a neo-brutalist terminal skeleton loader.
 * 2. If unauthenticated or non-admin (`!user || !isAdmin`), redirects to `/admin/login` preserving
 *    the intended return path in `location.state.from`.
 * 3. If authenticated & authorized, renders nested children or `<Outlet />`.
 */
export default function ProtectedRoute({
  children = null,
  redirectTo = "/admin/login",
  requireAdmin = true,
}) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. Session verification loading state
  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#f4f7f4] dark:bg-zinc-950 flex items-center justify-center p-4"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-[#1b2e23] dark:border-zinc-800 rounded-none shadow-brutal-forest dark:shadow-brutal p-0 overflow-hidden font-mono">
          {/* Terminal Window Header */}
          <div className="bg-[#e9f0ea] dark:bg-zinc-950 border-b border-[#cbdad0] dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-[#4b5e53] dark:text-zinc-400 ml-2 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-green" />
                session-guard.sh
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#6e8276] dark:text-zinc-500 font-bold">
              VERIFYING
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 space-y-3 text-sm text-[#0f1a14] dark:text-zinc-300">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-terminal-green">
              <span>$</span>
              <span>verifying session token...</span>
            </div>
            <p className="text-xs text-[#4b5e53] dark:text-zinc-500 leading-relaxed">
              Querying Firebase Auth and validating administrator whitelist credentials.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#4b5e53] dark:text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-green animate-ping" />
              <span>Authenticating...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated or non-whitelisted access redirection
  const isAuthorized = user && (!requireAdmin || isAdmin);

  if (!isAuthorized) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location, unauthorized: Boolean(user && !isAdmin) }}
        replace
      />
    );
  }

  // 3. Authorized access - render child elements or outlet
  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  redirectTo: PropTypes.string,
  requireAdmin: PropTypes.bool,
};
