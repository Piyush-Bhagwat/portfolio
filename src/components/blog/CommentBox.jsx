import { useState } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  PenLine,
} from "lucide-react";
import { TerminalBox, BrutalButton } from "../brutalist";
import CommentItem from "./CommentItem.jsx";
import CommentForm from "./CommentForm.jsx";

/**
 * Defensive relative/absolute date formatter for comments
 */
export function formatCommentDate(timestamp) {
  if (!timestamp) return "Just now";
  let date;
  if (typeof timestamp?.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  } else {
    return "Recently";
  }

  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Just now";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

/**
 * CommentBox - Tier 3 Right Sidebar Expandable Community Interaction Dock
 */
export default function CommentBox({
  post,
  ratingAverage = 0,
  ratingCount = 0,
  commentCount = 0,
  comments = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onOpenForm,
  onAddComment,
  onCommentAdded,
  formOpen,
  onToggleForm,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalFormOpen, setInternalFormOpen] = useState(false);

  const isFormOpen = formOpen !== undefined ? formOpen : internalFormOpen;
  const setIsFormOpen = onToggleForm || setInternalFormOpen;

  const effectiveAverage = Number(ratingAverage || post?.rating_average) || 0;
  const effectiveRatingCount = Number(ratingCount || post?.rating_count) || 0;
  const effectiveCommentCount =
    Number(commentCount || post?.comment_count) || 0;

  // Initial preview slice: up to 3 comments when collapsed
  const displayedComments = isExpanded ? comments : comments.slice(0, 3);
  const canExpand = comments.length > 3 || effectiveCommentCount > 3 || hasMore;

  return (
    <div id="comments-section" tabIndex={-1} className="focus:outline-none">
      <TerminalBox
        title="community.discussion"
        className={`border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm p-4 space-y-4 font-mono text-xs ${className}`}
      >
        {/* Rating Breakdown & Counters */}
        <div className="space-y-2 border-b border-[#cbdad0] dark:border-zinc-900 pb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#0f1a14] dark:text-zinc-200">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-terminal-green" />
              <span>Discussion & Reviews</span>
            </span>

            <span className="text-[10px] bg-[#e9f0ea] dark:bg-[#18181b] px-2 py-0.5 border border-[#cbdad0] dark:border-zinc-800 font-bold text-emerald-800 dark:text-emerald-400">
              {effectiveCommentCount === 1
                ? "1 comment"
                : `${effectiveCommentCount} comments`}
            </span>
          </div>

          {/* Rating Summary Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-3.5 h-3.5 ${
                      effectiveRatingCount > 0 &&
                      starIdx <= Math.round(effectiveAverage)
                        ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                        : "text-[#cbdad0] dark:text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span>
                {effectiveRatingCount > 0
                  ? `${effectiveAverage.toFixed(1)} (${effectiveRatingCount})`
                  : "New"}
              </span>
            </div>

            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500">
              {effectiveRatingCount > 0
                ? `${effectiveRatingCount} review${
                    effectiveRatingCount === 1 ? "" : "s"
                  }`
                : "No reviews yet"}
            </span>
          </div>

          {/* Action to trigger review submission or display CommentForm */}
          <div className="pt-2">
            {isFormOpen ? (
              <CommentForm
                postId={post?.id || ""}
                onSubmit={onAddComment}
                onCancel={() => setIsFormOpen(false)}
                onSuccess={(newComment) => {
                  setIsFormOpen(false);
                  if (onCommentAdded) {
                    onCommentAdded(newComment);
                  }
                }}
              />
            ) : (
              <BrutalButton
                variant="primary"
                size="sm"
                className="w-full text-xs active:translate-x-[2px] active:translate-y-[2px]"
                onClick={() => {
                  setIsFormOpen(true);
                  if (onOpenForm) onOpenForm();
                }}
                icon={<PenLine className="w-3.5 h-3.5" />}
              >
                Leave a Review / Comment
              </BrutalButton>
            )}
          </div>
        </div>

        {/* Comments Feed Area */}
        <div className="space-y-3">
          {loading && comments.length === 0 ? (
            <div className="p-5 border border-dashed border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-[#4b5e53] dark:text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-terminal-green" />
              <span>Loading discussions...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="border border-dashed border-[#cbdad0] dark:border-zinc-800 p-4 text-center space-y-1.5 text-xs text-[#4b5e53] dark:text-zinc-500">
              <MessageSquare className="w-5 h-5 mx-auto text-[#cbdad0] dark:text-zinc-600" />
              <p className="font-bold text-[#0f1a14] dark:text-zinc-300">
                No discussions yet
              </p>
              <p className="text-[11px]">
                Be the first to leave a review or ask a technical question.
              </p>
            </div>
          ) : (
            <div
              className={`space-y-2.5 ${
                isExpanded ? "max-h-[45vh] overflow-y-auto pr-1" : ""
              }`}
            >
              {displayedComments.map((comment) => (
                <CommentItem
                  key={
                    comment.id ||
                    `${comment.author_name}-${comment.created_at}`
                  }
                  comment={comment}
                />
              ))}
            </div>
          )}

          {/* Expand / Collapse & Load More Controls */}
          {canExpand && (
            <div className="pt-2 space-y-2 border-t border-[#cbdad0] dark:border-zinc-900">
              {/* Load More Button (when expanded and hasMore) */}
              {isExpanded && hasMore && (
                <BrutalButton
                  variant="outline"
                  size="sm"
                  className="w-full text-[11px]"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  icon={
                    loadingMore ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )
                  }
                >
                  {loadingMore ? "Loading comments..." : "Load Next 10 Comments"}
                </BrutalButton>
              )}

              {/* Drawer Expand / Collapse Toggle */}
              <BrutalButton
                variant="secondary"
                size="sm"
                className="w-full text-[11px]"
                onClick={() => setIsExpanded((prev) => !prev)}
                icon={
                  isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )
                }
              >
                {isExpanded
                  ? "Collapse Comments"
                  : `Expand / View All (${
                      effectiveCommentCount || comments.length
                    })`}
              </BrutalButton>
            </div>
          )}
        </div>
      </TerminalBox>
    </div>
  );
}

CommentBox.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    slug: PropTypes.string,
    title: PropTypes.string,
    rating_average: PropTypes.number,
    rating_count: PropTypes.number,
    comment_count: PropTypes.number,
  }),
  ratingAverage: PropTypes.number,
  ratingCount: PropTypes.number,
  commentCount: PropTypes.number,
  comments: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  loadingMore: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onOpenForm: PropTypes.func,
  onAddComment: PropTypes.func,
  onCommentAdded: PropTypes.func,
  formOpen: PropTypes.bool,
  onToggleForm: PropTypes.func,
  className: PropTypes.string,
};
