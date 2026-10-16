import { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CornerDownRight,
  Send,
} from "lucide-react";
import { BrutalButton } from "../brutalist";
import RatingStars from "../blog/RatingStars";

/**
 * AdminReplyModal - Author Response Composer
 * Allows the admin/author to publish or edit verified official replies to visitor comments.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Object|null} props.comment - Target comment object
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSaveReply - Async handler (commentId, replyContent, authorName) => Promise<void>
 * @param {string} [props.adminName="Piyush Bhagwat"] - Author display name
 */
export default function AdminReplyModal({
  isOpen,
  comment,
  onClose,
  onSaveReply,
  adminName = "Piyush Bhagwat",
}) {
  const [replyText, setReplyText] = useState("");
  const [authorName, setAuthorName] = useState(adminName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sync state whenever modal opens with target comment
  useEffect(() => {
    if (isOpen && comment) {
      setReplyText(comment.admin_reply?.content || "");
      setAuthorName(comment.admin_reply?.author || adminName);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, comment, adminName]);

  // Keyboard dismiss (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !comment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError("Reply content cannot be empty.");
      return;
    }

    if (replyText.trim().length > 1000) {
      setError("Reply cannot exceed 1000 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSaveReply(comment.id, replyText.trim(), authorName.trim() || adminName);
      onClose();
    } catch (err) {
      console.error("Failed to save admin reply:", err);
      setError(err.message || "Failed to publish reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono animate-fadeIn">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-700 shadow-brutal-forest dark:shadow-brutal z-10 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#e9f0ea] dark:bg-zinc-900 border-b border-[#1b2e23] dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-terminal-green rounded-none" />
            <span className="font-bold text-[#0f1a14] dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
              sys.author_reply_composer.sh
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-[#4b5e53] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Close reply composer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Comment Preview Context */}
          <div className="p-3 bg-[#f4f7f4] dark:bg-zinc-900/60 border border-[#cbdad0] dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <span className="text-[#0f1a14] dark:text-zinc-200 font-bold flex items-center gap-1.5">
                <span>{`@${comment.author_name}`}</span>
                <span className="text-[#6e8276] dark:text-zinc-500 font-normal">on</span>
                <span className="text-emerald-700 dark:text-terminal-cyan font-mono truncate max-w-[200px]">
                  {comment.post_title || comment.post_id}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <RatingStars rating={comment.rating || 5} size="sm" />
                <span className="text-[10px] text-[#4b5e53] dark:text-zinc-400 font-bold">
                  {`${comment.rating || 5}/5`}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#4b5e53] dark:text-zinc-300 italic bg-white dark:bg-zinc-950 p-2 border border-[#cbdad0] dark:border-zinc-800 line-clamp-3">
              &ldquo;{comment.content}&rdquo;
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Author Name / Handle */}
          <div className="space-y-1">
            <label
              htmlFor="reply-author-name"
              className="block text-xs font-bold text-[#0f1a14] dark:text-zinc-200 uppercase tracking-wide flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
              Author Name (Public Signature)
            </label>
            <input
              id="reply-author-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={isSubmitting}
              maxLength={50}
              className="w-full p-2 bg-white dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              placeholder="e.g. Piyush Bhagwat"
              required
            />
          </div>

          {/* Reply Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="reply-content"
                className="font-bold text-[#0f1a14] dark:text-zinc-200 uppercase tracking-wide flex items-center gap-1.5"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
                Verified Author Reply <span className="text-emerald-700 dark:text-terminal-green">*</span>
              </label>
              <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500">
                {`${replyText.length}/1000`}
              </span>
            </div>
            <textarea
              id="reply-content"
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
              placeholder="Write an official technical explanation, response to inquiry, or thank you..."
              className="w-full p-2.5 bg-white dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 placeholder-[#4b5e53]/60 dark:placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#cbdad0] dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <BrutalButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </BrutalButton>

            <BrutalButton
              type="submit"
              variant="terminal"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting || !replyText.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {comment.admin_reply ? "Update Official Reply" : "Publish Official Reply"}
            </BrutalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
