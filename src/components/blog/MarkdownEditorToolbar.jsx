import PropTypes from "prop-types";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Code,
  Quote,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Minus,
  Table,
  Columns,
  Eye,
  Edit3,
  ScrollText,
} from "lucide-react";

/**
 * MarkdownEditorToolbar - Formatting toolbar for Markdown post authoring
 */
export default function MarkdownEditorToolbar({
  onInsert,
  onOpenImageModal,
  viewMode = "split",
  onViewModeChange,
  syncScroll = true,
  onToggleSyncScroll,
}) {
  const btnClass =
    "p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 active:scale-95";

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs select-none">
      {/* Left formatting buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Headings */}
        <button
          type="button"
          onClick={() => onInsert("# ", "", "Heading 1")}
          title="Heading 1"
          aria-label="Heading 1"
          className={btnClass}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("## ", "", "Heading 2")}
          title="Heading 2"
          aria-label="Heading 2"
          className={btnClass}
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Inline styles */}
        <button
          type="button"
          onClick={() => onInsert("**", "**", "bold text")}
          title="Bold (**text**)"
          aria-label="Bold text"
          className={btnClass}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("*", "*", "italic text")}
          title="Italic (*text*)"
          aria-label="Italic text"
          className={btnClass}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("~~", "~~", "strikethrough text")}
          title="Strikethrough (~~text~~)"
          aria-label="Strikethrough text"
          className={btnClass}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Code */}
        <button
          type="button"
          onClick={() => onInsert("`", "`", "code")}
          title="Inline Code (`code`)"
          aria-label="Inline code"
          className={btnClass}
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("```javascript\n", "\n```", "// write code here")}
          title="Code Block (```)"
          aria-label="Code block"
          className={btnClass}
        >
          <span className="font-bold text-[11px] px-1">{"{ }"}</span>
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => onInsert("> ", "", "Quote text")}
          title="Blockquote (>)"
          aria-label="Blockquote"
          className={btnClass}
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("- ", "", "List item")}
          title="Bullet List (-)"
          aria-label="Bullet list"
          className={btnClass}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("1. ", "", "Ordered item")}
          title="Numbered List (1.)"
          aria-label="Numbered list"
          className={btnClass}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Inserts: Links, Media, Tables */}
        <button
          type="button"
          onClick={() => onInsert("[", "](https://example.com)", "link title")}
          title="Insert Link [title](url)"
          aria-label="Insert link"
          className={btnClass}
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenImageModal) {
              onOpenImageModal();
            } else {
              onInsert("![", "](https://res.cloudinary.com/...)", "alt text");
            }
          }}
          title="Insert Image (Cloudinary or URL)"
          aria-label="Insert image"
          className={`${btnClass} text-terminal-cyan hover:text-terminal-cyan`}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            onInsert(
              "| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n",
              "",
              ""
            )
          }
          title="Insert Table"
          aria-label="Insert table"
          className={btnClass}
        >
          <Table className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert("\n---\n", "", "")}
          title="Horizontal Rule (---)"
          aria-label="Horizontal rule"
          className={btnClass}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Right controls: View modes & Sync Scroll */}
      <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
        {onToggleSyncScroll && (
          <button
            type="button"
            onClick={onToggleSyncScroll}
            title={syncScroll ? "Sync Scroll Enabled" : "Sync Scroll Disabled"}
            aria-label="Toggle sync scroll"
            className={`px-2 py-1 flex items-center gap-1 text-[11px] border transition-colors ${
              syncScroll
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sync Scroll</span>
          </button>
        )}

        {onViewModeChange && (
          <div className="flex items-center border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={() => onViewModeChange("edit")}
              title="Editor Only"
              aria-label="Editor only view"
              className={`p-1.5 transition-colors ${
                viewMode === "edit"
                  ? "bg-terminal-cyan text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              title="Split Screen View"
              aria-label="Split screen view"
              className={`p-1.5 transition-colors ${
                viewMode === "split"
                  ? "bg-terminal-cyan text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("preview")}
              title="Preview Only"
              aria-label="Preview only view"
              className={`p-1.5 transition-colors ${
                viewMode === "preview"
                  ? "bg-terminal-cyan text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

MarkdownEditorToolbar.propTypes = {
  onInsert: PropTypes.func.isRequired,
  onOpenImageModal: PropTypes.func,
  viewMode: PropTypes.oneOf(["split", "edit", "preview"]),
  onViewModeChange: PropTypes.func,
  syncScroll: PropTypes.bool,
  onToggleSyncScroll: PropTypes.func,
};
