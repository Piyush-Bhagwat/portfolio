import { useState } from "react";
import PropTypes from "prop-types";
import { AlertCircle, CheckCircle2, Send, X } from "lucide-react";
import RatingStars from "./RatingStars.jsx";
import { BrutalButton } from "../brutalist";
import { validateCommentPayload } from "../../services/commentsService.js";

/**
 * CommentForm - Neo-Brutalist Review & Comment Submission Form
 */
export default function CommentForm({
  postId,
  onSubmit,
  onCancel,
  onSuccess,
  className = "",
}) {
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Front-end payload validation
    const payload = {
      author_name: authorName,
      rating,
      content,
      post_id: postId,
    };

    const validation = validateCommentPayload(payload);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
      return;
    }

    if (!onSubmit) {
      setErrorMessage("No submission handler provided.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await onSubmit(validation.sanitized);
      setSuccessMessage("Review posted successfully! Thank you for sharing your thoughts.");

      // Reset form fields
      setAuthorName("");
      setContent("");
      setRating(5);

      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrorMessage(err.message || "Failed to submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-900/90 p-4 space-y-4 font-mono text-xs shadow-brutal-forest dark:shadow-brutal-sm ${className}`}
    >
      {/* Header with Title & Cancel Action */}
      <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-800 pb-2">
        <span className="font-bold uppercase tracking-wider text-emerald-800 dark:text-terminal-green text-[11px] flex items-center gap-1.5">
          <span>Leave a Review & Comment</span>
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-[#4b5e53] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-200 p-0.5 focus:outline-none"
            aria-label="Close review form"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-2.5 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 text-red-700 dark:text-red-400 flex items-start gap-2 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-sans leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-[11px]">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-sans leading-snug">{successMessage}</span>
        </div>
      )}

      {/* 1. Rating Selector Field */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-[#0f1a14] dark:text-zinc-300 uppercase tracking-wide">
          Your Rating <span className="text-emerald-700 dark:text-terminal-green">*</span>
        </label>
        <div className="p-2 bg-white dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between">
          <RatingStars
            rating={rating}
            interactive={true}
            onChange={setRating}
            size="md"
            showLabel={true}
            disabled={isSubmitting}
          />
          <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 select-none">
            {rating} / 5 stars
          </span>
        </div>
      </div>

      {/* 2. Author Display Name Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="comment-author-name"
            className="block text-[11px] font-bold text-[#0f1a14] dark:text-zinc-300 uppercase tracking-wide"
          >
            Author Name / Handle <span className="text-emerald-700 dark:text-terminal-green">*</span>
          </label>
          <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500">
            {`${authorName.length}/50`}
          </span>
        </div>
        <input
          id="comment-author-name"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={50}
          disabled={isSubmitting}
          placeholder="e.g. dev_alex or Sarah Connor"
          className="w-full p-2 bg-white dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 placeholder-[#4b5e53]/60 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green font-mono text-xs shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
          required
        />
      </div>

      {/* 3. Review Comment Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="comment-content"
            className="block text-[11px] font-bold text-[#0f1a14] dark:text-zinc-300 uppercase tracking-wide"
          >
            Discussion / Review Content <span className="text-emerald-700 dark:text-terminal-green">*</span>
          </label>
          <span
            className={`text-[10px] ${
              content.length > 1900
                ? "text-amber-600 dark:text-amber-400 font-bold"
                : "text-[#4b5e53] dark:text-zinc-500"
            }`}
          >
            {`${content.length}/2000`}
          </span>
        </div>
        <textarea
          id="comment-content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          disabled={isSubmitting}
          placeholder="Share your architectural thoughts, questions, or critical evaluation of this publication..."
          className="w-full p-2.5 bg-white dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 placeholder-[#4b5e53]/60 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-600 dark:focus:border-terminal-green font-sans text-xs leading-relaxed shadow-[2px_2px_0px_0px_#1b2e23] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors resize-y min-h-[90px]"
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#cbdad0] dark:border-zinc-800">
        {onCancel && (
          <BrutalButton
            variant="outline"
            size="sm"
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="text-[11px]"
          >
            Cancel
          </BrutalButton>
        )}
        <BrutalButton
          variant="primary"
          size="sm"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<Send className="w-3 h-3" />}
          className="active:translate-x-[2px] active:translate-y-[2px] text-[11px]"
        >
          {isSubmitting ? "Submitting Review..." : "Publish Review"}
        </BrutalButton>
      </div>
    </form>
  );
}

CommentForm.propTypes = {
  postId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
  className: PropTypes.string,
};
