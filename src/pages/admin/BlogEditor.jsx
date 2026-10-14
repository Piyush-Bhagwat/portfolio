import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import {
  BrutalButton,
  TagBadge,
  TerminalBox,
  StatusPill,
} from "../../components/brutalist";
import MarkdownEditorToolbar from "../../components/blog/MarkdownEditorToolbar.jsx";
import MarkdownPreview from "../../components/blog/MarkdownPreview.jsx";
import {
  Save,
  ArrowLeft,
  BookOpen,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  RefreshCw,
} from "lucide-react";
import {
  uploadToCloudinary,
  validateImageFile,
} from "../../services/cloudinary.js";
import BlogImageDropperModal, {
  filenameToAltText,
  formatMarkdownImage,
} from "../../components/blog/BlogImageDropperModal.jsx";

export const DEFAULT_BLOG_MARKDOWN = `# Building Resilient Web Interfaces with Neo-Brutalism

A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens and modern accessibility standards.

## Architecture Overview

Modern web design often leans heavily on flat, homogenized components. Neo-Brutalism brings back bold boundaries, high-contrast borders, and tactile physical feedback.

### Key Tenets
1. **High Contrast**: Clean 2px solid borders with deliberate color blocking.
2. **Tactile Interaction**: Active translation transforms (\`translate-x-0.5 translate-y-0.5\`).
3. **Typography**: Monospace and system fonts that evoke classic terminal consoles.

\`\`\`javascript
// Example: Neo-Brutalist button primitive
export function BrutalButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-black bg-emerald-400 px-4 py-2 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
    >
      {children}
    </button>
  );
}
\`\`\`

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."

## Performance Benchmarks
| Framework | First Contentful Paint | Bundle Size |
| :--- | :--- | :--- |
| React + Vite | 0.4s | 42 KB |
| Legacy SPA | 1.8s | 340 KB |

---
*Published by Piyush Bhagwat*
`;

/**
 * Utility to calculate reading time
 */
export function calculateReadTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Utility to generate URL slugs
 */
export function slugifyTitle(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * BlogEditor - Split-Screen Markdown Authoring Environment
 */
export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("Building Resilient Web Interfaces with Neo-Brutalism");
  const [slug, setSlug] = useState("building-resilient-web-interfaces");
  const [content, setContent] = useState(DEFAULT_BLOG_MARKDOWN);
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState(["React", "UI Engineering", "Design Systems"]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(Boolean(id));
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  // View mode and scroll sync controls
  const [viewMode, setViewMode] = useState("split"); // "split" | "edit" | "preview"
  const [syncScroll, setSyncScroll] = useState(true);

  // In-editor image dropper & modal controls
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalInitialAlt, setModalInitialAlt] = useState("");
  const [isEditorDragActive, setIsEditorDragActive] = useState(false);
  const [directUploadStatus, setDirectUploadStatus] = useState(null); // { isUploading, progress, filename }

  const textareaRef = useRef(null);
  const previewContainerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const cursorPosRef = useRef({ start: 0, end: 0 });

  // Fetch article if editing existing ID
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setSyncing(true);
      try {
        const docRef = doc(db, "blogs", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setSlug(data.slug || id);
          setContent(data.content_markdown || "");
          setPublished(Boolean(data.published));
          setTags(Array.isArray(data.tags) ? data.tags : []);
        } else {
          setFeedback({
            type: "error",
            message: `Article with ID "${id}" was not found in Firestore.`,
          });
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setFeedback({
          type: "error",
          message: "Failed to load post from Firestore.",
        });
      } finally {
        setSyncing(false);
      }
    };

    fetchPost();
  }, [id]);

  // Synchronized scrolling handler
  const handleEditorScroll = (e) => {
    if (!syncScroll || !previewContainerRef.current || isScrollingRef.current) return;

    isScrollingRef.current = true;
    const editor = e.target;
    const preview = previewContainerRef.current;

    const scrollPercentage =
      editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    preview.scrollTop =
      scrollPercentage * (preview.scrollHeight - preview.clientHeight);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 50);
  };

  // Quick formatting toolbar insertion
  const handleInsert = (prefix, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Open Cloudinary image modal and capture cursor position
  const handleOpenImageModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      cursorPosRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
      const selected = content.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
      setModalInitialAlt(selected.trim());
    } else {
      cursorPosRef.current = {
        start: content.length,
        end: content.length,
      };
      setModalInitialAlt("");
    }
    setIsImageModalOpen(true);
  };

  // Insert markdown snippet at the saved cursor position
  const insertSnippetAtCursor = (snippet) => {
    const textarea = textareaRef.current;
    const pos = cursorPosRef.current || { start: content.length, end: content.length };
    const start = typeof pos.start === "number" ? pos.start : content.length;
    const end = typeof pos.end === "number" ? pos.end : content.length;

    const before = content.substring(0, start);
    const after = content.substring(end);
    const updated = `${before}\n\n${snippet}\n\n${after}`;

    setContent(updated);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPos = start + snippet.length + 4;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Callback when user confirms image insertion from modal
  const handleInsertImageFromModal = ({ url, altText, caption }) => {
    const snippet = formatMarkdownImage(altText, url, caption);
    insertSnippetAtCursor(snippet);
    setFeedback({
      type: "success",
      message: `Image "${altText || "asset"}" inserted into Markdown source.`,
    });
  };

  // Direct Cloudinary upload handler (used by drag-and-drop & paste)
  const uploadDirectImage = async (file, insertIndex) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFeedback({ type: "error", message: validation.error });
      return;
    }

    const placeholder = `\n\n![Uploading ${file.name}...]()\n\n`;
    const safeIndex = typeof insertIndex === "number" ? insertIndex : content.length;
    const before = content.substring(0, safeIndex);
    const after = content.substring(safeIndex);
    const contentWithPlaceholder = `${before}${placeholder}${after}`;
    setContent(contentWithPlaceholder);

    setDirectUploadStatus({
      isUploading: true,
      progress: 0,
      filename: file.name,
    });

    try {
      const result = await uploadToCloudinary(
        file,
        "portfolio/blogs",
        (pct) => {
          setDirectUploadStatus((prev) =>
            prev ? { ...prev, progress: pct } : null
          );
        }
      );

      const alt = filenameToAltText(file.name);
      const markdownImage = `\n\n${formatMarkdownImage(alt, result.secure_url)}\n\n`;

      setContent((prevContent) =>
        prevContent.replace(placeholder, markdownImage)
      );

      setFeedback({
        type: "success",
        message: `Image "${file.name}" uploaded to Cloudinary (portfolio/blogs) and inserted!`,
      });
    } catch (err) {
      console.error("Direct image upload failed:", err);
      setContent((prevContent) =>
        prevContent.replace(
          placeholder,
          `\n\n<!-- Failed to upload ${file.name}: ${err.message} -->\n\n`
        )
      );
      setFeedback({
        type: "error",
        message: `Image upload failed: ${err.message}`,
      });
    } finally {
      setDirectUploadStatus(null);
    }
  };

  // Drag and drop event handlers on editor pane
  const handleEditorDragOver = (e) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditorDragActive(true);
    }
  };

  const handleEditorDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsEditorDragActive(false);
    }
  };

  const handleEditorDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditorDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const textarea = textareaRef.current;
      const insertIndex = textarea ? textarea.selectionStart : content.length;
      uploadDirectImage(file, insertIndex);
    }
  };

  // Clipboard paste event listener (supports screenshot Cmd+V / Ctrl+V)
  const handleTextareaPaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = Array.from(e.clipboardData.files).find((f) =>
        f.type.startsWith("image/")
      );
      if (file) {
        e.preventDefault();
        const textarea = textareaRef.current;
        const insertIndex = textarea ? textarea.selectionStart : content.length;
        uploadDirectImage(file, insertIndex);
      }
    }
  };

  // Add / remove tags
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save handler
  const handleSave = async (publishStatus = published) => {
    if (!title.trim()) {
      setFeedback({ type: "error", message: "Article title is required." });
      return;
    }
    if (!content.trim()) {
      setFeedback({ type: "error", message: "Markdown content cannot be empty." });
      return;
    }

    setSaving(true);
    setFeedback({ type: null, message: "" });

    try {
      const docId = id || slugifyTitle(slug || title);
      const docRef = doc(db, "blogs", docId);
      const readTime = calculateReadTime(content);

      const payload = {
        title: title.trim(),
        slug: slugifyTitle(slug || title),
        content_markdown: content,
        tags,
        published: Boolean(publishStatus),
        read_time_minutes: readTime,
        updated_at: serverTimestamp(),
      };

      if (!id) {
        payload.created_at = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });

      setFeedback({
        type: "success",
        message: `Article "${title}" saved successfully as ${
          publishStatus ? "PUBLISHED" : "DRAFT"
        }.`,
      });

      if (!id) {
        navigate(`/admin/blogs/edit/${docId}`, { replace: true });
      }
    } catch (err) {
      console.error("Save blog error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to persist article to Firestore.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Metrics telemetry
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = calculateReadTime(content);
  const lineCount = content.split("\n").length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-green mb-1">
            <Link
              to="/admin/blogs"
              className="hover:underline flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>sys.cms.blogs</span>
            </Link>
            <span>/</span>
            <span className="text-terminal-cyan">
              {id ? `edit:${id}` : "new_article"}
            </span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-terminal-green" />
            {id ? "Edit Technical Article" : "Markdown Authoring Studio"}
          </h1>
        </div>

        {/* Action Controls & Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {syncing && <StatusPill status="SYNCING..." variant="terminal" />}

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
            <Clock className="w-3 h-3 text-terminal-cyan" />
            <span>{readTime} min read</span>
            <span className="text-zinc-600">|</span>
            <span>{wordCount} words</span>
          </div>

          <BrutalButton
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            loading={saving && !published}
            disabled={saving}
          >
            Save Draft
          </BrutalButton>

          <BrutalButton
            variant="terminal"
            size="sm"
            onClick={() => {
              setPublished(true);
              handleSave(true);
            }}
            loading={saving && published}
            disabled={saving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Publish Article
          </BrutalButton>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.type && (
        <div
          className={`
            p-3 border font-mono text-xs flex items-start gap-2 shadow-brutal-sm
            ${
              feedback.type === "success"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Post Metadata Inputs: Title, Slug, Tags */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-brutal-sm space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="blog-title" className="block text-zinc-300 font-bold">
              Article Headline / Title *
            </label>
            <input
              id="blog-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!id) setSlug(slugifyTitle(e.target.value));
              }}
              placeholder="e.g. Architecting Zero-Cost Static CMS with Firestore"
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="blog-slug" className="block text-zinc-300 font-bold">
              URL Slug *
            </label>
            <input
              id="blog-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugifyTitle(e.target.value))}
              placeholder="e.g. zero-cost-cms"
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-terminal-green px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Tags input */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 font-bold">Tags:</span>
          <div className="flex items-center gap-1.5 flex-1 max-w-sm">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-terminal-green px-2 py-1 text-zinc-200 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-2 py-1 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagBadge
                key={tag}
                variant="terminal"
                size="sm"
                onRemove={() => handleRemoveTag(tag)}
              >
                {tag}
              </TagBadge>
            ))}
          </div>
        </div>
      </div>

      {/* Split-Screen Markdown Studio */}
      <TerminalBox
        title="split_markdown_editor.sh"
        className="border-2 border-zinc-800 shadow-brutal flex flex-col min-h-[650px] overflow-hidden"
      >
        {/* Toolbar */}
        <MarkdownEditorToolbar
          onInsert={handleInsert}
          onOpenImageModal={handleOpenImageModal}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          syncScroll={syncScroll}
          onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        />

        {/* Split Screen Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 h-[600px] overflow-hidden">
          {/* Left Pane: Editor */}
          {(viewMode === "split" || viewMode === "edit") && (
            <div
              onDragEnter={handleEditorDragOver}
              onDragOver={handleEditorDragOver}
              onDragLeave={handleEditorDragLeave}
              onDrop={handleEditorDrop}
              className={`relative flex flex-col h-full bg-zinc-950 ${
                viewMode === "edit" ? "lg:col-span-2" : ""
              }`}
            >
              {/* Direct Drag & Drop Active Overlay */}
              {isEditorDragActive && (
                <div className="absolute inset-0 z-30 bg-black/90 border-2 border-dashed border-terminal-green flex flex-col items-center justify-center p-6 text-center select-none font-mono">
                  <UploadCloud className="w-12 h-12 text-terminal-green animate-bounce mb-3" />
                  <p className="text-sm font-bold text-zinc-100 tracking-wide">
                    DROP IMAGE TO UPLOAD TO CLOUDINARY
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    folder: portfolio/blogs &bull; Injected directly at cursor
                  </p>
                </div>
              )}

              {/* Editor Pane Sub-header */}
              <div className="bg-zinc-900/60 px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-terminal-cyan" />
                  EDITOR (MARKDOWN SOURCE)
                </span>

                <div className="flex items-center gap-2">
                  {directUploadStatus?.isUploading ? (
                    <span className="flex items-center gap-1 text-terminal-green text-[10px] animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Uploading {directUploadStatus.filename} ({directUploadStatus.progress}%)
                    </span>
                  ) : (
                    <span className="hidden sm:inline text-[10px] text-zinc-500">
                      Drag & drop / Paste image directly
                    </span>
                  )}
                  <span className="text-zinc-600">|</span>
                  <span>{lineCount} lines</span>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Line numbers gutter */}
                <div className="w-10 bg-zinc-900/40 border-r border-zinc-800/80 py-4 select-none font-mono text-[11px] text-zinc-600 text-right pr-2 leading-6 overflow-hidden">
                  {Array.from({ length: Math.min(lineCount, 500) }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onScroll={handleEditorScroll}
                  onPaste={handleTextareaPaste}
                  placeholder="# Write your technical post in Markdown here..."
                  aria-label="Markdown content input"
                  className="flex-1 p-4 bg-transparent text-zinc-100 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-6 overflow-y-auto selection:bg-terminal-green selection:text-black"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* Right Pane: Real-Time Preview */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`flex flex-col h-full bg-zinc-950 ${viewMode === "preview" ? "lg:col-span-2" : ""}`}>
              <div className="bg-zinc-900/60 px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold flex items-center gap-1.5 text-terminal-green">
                  <Sparkles className="w-3.5 h-3.5" />
                  LIVE PREVIEW (GFM RENDERED)
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">
                  {published ? "Status: Published" : "Status: Draft"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto bg-zinc-950">
                <MarkdownPreview
                  ref={previewContainerRef}
                  content={content}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </div>
      </TerminalBox>

      {/* Cloudinary In-Editor Image Dropper Modal */}
      <BlogImageDropperModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertImageFromModal}
        initialAltText={modalInitialAlt}
        folder="portfolio/blogs"
      />
    </div>
  );
}
