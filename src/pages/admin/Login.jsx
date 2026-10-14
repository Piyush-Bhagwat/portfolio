import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { resetAdminPassword } from "../../services/firebase.js";
import { TerminalBox, BrutalButton, StatusPill } from "../../components/brutalist";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  CornerDownLeft,
  Shield,
  KeyRound,
} from "lucide-react";

/**
 * Admin Login Page
 * Neo-Brutalist terminal authentication gateway restricted to the site owner.
 */
export default function Login() {
  const { user, isAdmin, login, adminEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(adminEmail || "piyushbhagwat5@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState(() => {
    if (location.state?.unauthorized) {
      return `Access Denied: The authenticated account is not authorized. Access is strictly restricted to ${adminEmail}.`;
    }
    return null;
  });
  const [infoMessage, setInfoMessage] = useState(null);

  // If already logged in as authorized admin, redirect immediately
  useEffect(() => {
    if (user && isAdmin) {
      const returnPath = location.state?.from?.pathname || "/admin/overview";
      navigate(returnPath, { replace: true });
    }
  }, [user, isAdmin, navigate, location.state]);

  // Handle runtime unauthorized updates
  useEffect(() => {
    if (location.state?.unauthorized) {
      setError(
        `Access Denied: The authenticated account is not authorized. Access is strictly restricted to ${adminEmail}.`
      );
    }
  }, [location.state, adminEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) {
      setError("Please provide an administrator email address.");
      return;
    }
    if (!password) {
      setError("Please enter your administrator password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(trimmedEmail, password);
      const returnPath = location.state?.from?.pathname || "/admin/overview";
      navigate(returnPath, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setInfoMessage(null);
    setResettingPassword(true);

    try {
      await resetAdminPassword(email);
      setInfoMessage(`Password recovery email dispatched to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err.message || "Failed to send recovery email.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center p-4 selection:bg-terminal-green selection:text-zinc-950">
      {/* Background dot grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-lg z-10 space-y-4">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-bold">
              SYS // AUTH
            </span>
            <span className="text-zinc-700">/</span>
            <StatusPill status="GATEWAY LOCKED" variant="terminal" />
          </div>
          <Link
            to="/"
            className="font-mono text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>

        {/* Terminal Login Window */}
        <TerminalBox
          title="auth-gateway.sh"
          className="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-zinc-800"
          bodyClassName="p-6 md:p-8 space-y-6"
        >
          {/* Welcome Prompt */}
          <div className="border-b border-zinc-800/80 pb-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-terminal-green">
              <span>$</span>
              <span>sudo access-admin-cms --authenticate</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 tracking-tight">
              Administrative Gateway
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Restricted to authorized administrator (<code className="text-terminal-cyan">{adminEmail}</code>).
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="p-3.5 bg-rose-950/40 border border-rose-800 text-rose-300 font-mono text-xs flex items-start gap-2.5 shadow-brutal-sm"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-400">[AUTH_ERROR]</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div
              className="p-3.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-start gap-2.5 shadow-brutal-sm"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-400">[DISPATCHED]</span>
                <p className="leading-relaxed">{infoMessage}</p>
              </div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block font-mono text-xs text-zinc-300 font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Admin Email
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">whitelisted</span>
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3.5 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-terminal-green transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block font-mono text-xs text-zinc-300 font-medium flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resettingPassword}
                  className="text-[11px] font-mono text-terminal-cyan hover:underline disabled:opacity-50"
                >
                  {resettingPassword ? "Sending reset..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-green px-3.5 py-2.5 pr-10 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-terminal-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <BrutalButton
                type="submit"
                variant="terminal"
                size="md"
                loading={submitting}
                disabled={submitting}
                className="w-full justify-center"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {submitting ? "Authenticating session..." : "$ sign-in --admin"}
              </BrutalButton>
            </div>
          </form>

          {/* Footer Security Note */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-terminal-green" />
              Firebase Auth Security
            </span>
            <span className="flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-zinc-600" />
              Session Guard Active
            </span>
          </div>
        </TerminalBox>
      </div>
    </div>
  );
}
