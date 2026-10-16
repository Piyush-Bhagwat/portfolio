import PropTypes from "prop-types";
import { Star, ShieldCheck } from "lucide-react";
import { formatCommentDate } from "./CommentBox.jsx";

/**
 * CommentItem - Neo-Brutalist comment item card with author reply support
 */
export default function CommentItem({ comment, className = "" }) {
  if (!comment) return null;

  const authorName = comment.author_name || "Anonymous Reader";
  const rating = Number(comment.rating) || 5;
  const content = comment.content || "";
  const displayDate = formatCommentDate(comment.created_at);
  const adminReply = comment.admin_reply;

  return (
    <article
      className={`border border-[#cbdad0] dark:border-zinc-800 bg-[#f4f7f4]/60 dark:bg-zinc-900/50 p-3 space-y-2 text-xs font-mono ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 border-b border-[#cbdad0]/60 dark:border-zinc-800/80 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0f1a14] dark:text-zinc-200 truncate max-w-[140px]">
            {authorName}
          </span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#e9f0ea] dark:bg-[#18181b] border border-[#cbdad0] dark:border-zinc-800 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            <span>{rating}</span>
          </span>
        </div>

        <span className="text-[10px] text-[#4b5e53] dark:text-zinc-500 shrink-0">
          {displayDate}
        </span>
      </div>

      {/* Comment Body */}
      <p className="text-xs text-[#0f1a14] dark:text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>

      {/* Verified Author Reply */}
      {adminReply && (
        <div className="mt-2.5 pl-3 border-l-2 border-emerald-600 dark:border-terminal-green bg-emerald-50/70 dark:bg-emerald-950/20 py-2 pr-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-terminal-green font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>{adminReply.author ? `Verified Author (${adminReply.author})` : "Verified Author"}</span>
            </span>
            <span className="text-[#4b5e53] dark:text-zinc-500">
              {formatCommentDate(adminReply.replied_at)}
            </span>
          </div>
          <p className="text-[11px] text-[#0f1a14] dark:text-zinc-300 font-sans leading-relaxed break-words">
            {adminReply.content}
          </p>
        </div>
      )}
    </article>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string,
    author_name: PropTypes.string,
    rating: PropTypes.number,
    content: PropTypes.string,
    created_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
    admin_reply: PropTypes.shape({
      author: PropTypes.string,
      content: PropTypes.string,
      replied_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
    }),
  }),
  className: PropTypes.string,
};
