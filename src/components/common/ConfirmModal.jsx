import { useEffect } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, X } from "lucide-react";
import { BrutalButton } from "../brutalist";

/**
 * ConfirmModal - Neo-Brutalist confirmation dialog for destructive or critical actions
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "sys.confirm_action.sh",
  message = "Are you sure you want to proceed with this action? This operation cannot be undone.",
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "terminal" | "warning"
  loading = false,
}) {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-[#0f1a14] dark:text-zinc-100">
        {/* Modal Header */}
        <div className="bg-[#e9f0ea] dark:bg-zinc-900 px-4 py-2.5 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                variant === "danger" ? "bg-rose-500" : "bg-amber-400"
              }`}
            />
            <span id="confirm-modal-title" className="font-bold text-[#0f1a14] dark:text-zinc-200">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-white p-1 hover:bg-[#cbdad0]/50 dark:hover:bg-zinc-800 border border-transparent hover:border-[#cbdad0] dark:hover:border-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 border shrink-0 ${
                variant === "danger"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[#0f1a14] dark:text-zinc-200 text-sm font-bold tracking-tight">
                Confirmation Required
              </p>
              <p className="text-[#4b5e53] dark:text-zinc-400 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#cbdad0] dark:border-zinc-800/80">
            <BrutalButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </BrutalButton>

            <BrutalButton
              type="button"
              variant={variant === "danger" ? "danger" : "terminal"}
              size="sm"
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmText}
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(["danger", "terminal", "warning"]),
  loading: PropTypes.bool,
};
