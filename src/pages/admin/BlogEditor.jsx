import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import {
  BrutalButton,
  TagBadge,
  TerminalBox,
  StatusPill,
} from "../../components/brutalist";
import MarkdownEditorToolbar from "../../components/blog/MarkdownEditorToolbar.jsx";
import MarkdownPreview from "../../components/blog/MarkdownPreview.jsx";
import ImageUploader from "../../components/common/ImageUploader.jsx";
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
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import {
  uploadToCloudinary,
  validateImageFile,
} from "../../services/cloudinary.js";
import BlogImageDropperModal, {
  filenameToAltText,
  formatMarkdownImage,
} from "../../components/blog/BlogImageDropperModal.jsx";
import {
  DEFAULT_BLOG_MARKDOWN,
  SUGGESTED_TAGS,
  calculateReadTime,
  slugifyTitle,
  checkSlugCollision,
} from "../../utils/blogUtils.js";

// Re-export utilities for external consumers and test suites
export {
  DEFAULT_BLOG_MARKDOWN,
  SUGGESTED_TAGS,
  calculateReadTime,
  slugifyTitle,
  checkSlugCollision,
};

/**
 * BlogEditor - Split-Screen Markdown Authoring Studio with Post Metadata & Publishing Pipeline
 */
export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core metadata states
  const [title, setTitle] = useState("Building Resilient Web Interfaces with Neo-Brutalism");
  const [slug, setSlug] = useState("building-resilient-web-interfaces");
  const [excerpt, setExcerpt] = useState(
    "A deep dive into building tactile, high-contrast user interfaces with zero-runtime CSS tokens and modern accessibility standards."
  );
  const [content, setContent] = useState(DEFAULT_BLOG_MARKDOWN);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImagePublicId, setCoverImagePublicId] = useState("");
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);
  const [tags, setTags] = useState(["React", "UI Engineering", "Design Systems"]);
  const [tagInput, setTagInput] = useState("");

  // Process states
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(Boolean(id));
  const [isDirty, setIsDirty] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState(null); // { state: "available" | "duplicate", message: string }
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

  // Warn before closing tab with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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
          setExcerpt(data.excerpt || "");
          setContent(data.content_markdown || "");
          setCoverImageUrl(data.cover_image_url || "");
          setCoverImagePublicId(data.cover_image_public_id || "");
          setPublished(Boolean(data.published));
          setPublishedAt(data.published_at || null);
          setTags(Array.isArray(data.tags) ? data.tags : []);
          setIsDirty(false);
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
    setIsDirty(true);

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
    setIsDirty(true);

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
    setIsDirty(true);

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
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  // On-demand slug uniqueness validation
  const handleCheckSlug = async () => {
    const targetSlug = slugifyTitle(slug || title);
    if (!targetSlug) return;

    setSlugChecking(true);
    setSlugStatus(null);

    const collision = await checkSlugCollision(db, targetSlug, id);
    setSlugChecking(false);

    if (collision.isDuplicate) {
      setSlugStatus({
        state: "duplicate",
        message: `Slug in use! Auto-suggested: "${collision.suggestedSlug}"`,
        suggested: collision.suggestedSlug,
      });
    } else {
      setSlugStatus({
        state: "available",
        message: "Slug is unique & available for this post.",
      });
    }
  };

  // Save handler with slug collision auto-resolution and publishing controls
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
      // Validate slug collision before committing
      let finalSlug = slugifyTitle(slug || title);
      const collision = await checkSlugCollision(db, finalSlug, id);
      if (collision.isDuplicate) {
        finalSlug = collision.suggestedSlug;
        setSlug(finalSlug);
      }

      const docId = id || finalSlug;
      const docRef = doc(db, "blogs", docId);
      const readTime = calculateReadTime(content);

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content_markdown: content,
        cover_image_url: coverImageUrl || "",
        cover_image_public_id: coverImagePublicId || "",
        tags,
        published: Boolean(publishStatus),
        read_time_minutes: readTime,
        updated_at: serverTimestamp(),
      };

      if (!id) {
        payload.created_at = serverTimestamp();
      }

      // If changing to published for the first time, record published_at
      if (publishStatus && !publishedAt) {
        payload.published_at = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });

      setIsDirty(false);
      setPublished(Boolean(publishStatus));
      setFeedback({
        type: "success",
        message: `Article "${title}" saved successfully as ${
          publishStatus ? "PUBLISHED" : "DRAFT"
        }${collision.isDuplicate ? ` (Slug resolved to "${finalSlug}")` : ""}.`,
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

  // Metrics metadata
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = calculateReadTime(content);
  const lineCount = content.split("\n").length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cbdad0] dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-terminal-green mb-1">
            <Link
              to="/admin/blogs"
              className="hover:underline flex items-center gap-1 text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>sys.cms.blogs</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-600 dark:text-terminal-cyan">
              {id ? `edit:${id}` : "new_article"}
            </span>
            {isDirty && (
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-bold animate-pulse">
                * unsaved changes
              </span>
            )}
          </div>
          <h1 className="text-2xl font-mono font-bold text-[#0f1a14] dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-terminal-green" />
            {id ? "Edit Technical Article" : "Markdown Authoring Studio"}
          </h1>
        </div>

        {/* Action Controls & Metadata */}
        <div className="flex flex-wrap items-center gap-2.5">
          {syncing && <StatusPill status="SYNCING..." variant="terminal" />}

          <div className="flex items-center gap-1 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 px-2.5 py-1 text-[11px] font-mono text-[#4b5e53] dark:text-zinc-400">
            <Clock className="w-3 h-3 text-emerald-600 dark:text-terminal-cyan" />
            <span>{readTime} min read</span>
            <span className="text-[#cbdad0] dark:text-zinc-600">|</span>
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
            {published ? "Update Published" : "Publish Article"}
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
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase">[{feedback.type}]</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Post Metadata Inputs: Title, Slug, Excerpt, Cover & Tags */}
      <div className="p-4 sm:p-5 bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal space-y-4 font-mono text-xs">
        {/* Row 1: Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="blog-title" className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
              Article Headline / Title *
            </label>
            <input
              id="blog-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
                if (!id) {
                  setSlug(slugifyTitle(e.target.value));
                  setSlugStatus(null);
                }
              }}
              placeholder="e.g. Architecting Zero-Cost Static CMS with Firestore"
              className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-500 font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="blog-slug" className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
                URL Slug *
              </label>
              {slugStatus && (
                <span
                  className={`text-[10px] font-bold ${
                    slugStatus.state === "available"
                      ? "text-emerald-700 dark:text-terminal-green"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  [{slugStatus.state.toUpperCase()}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                id="blog-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(slugifyTitle(e.target.value));
                  setIsDirty(true);
                  setSlugStatus(null);
                }}
                placeholder="e.g. zero-cost-cms"
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-500 font-mono text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCheckSlug}
                disabled={slugChecking}
                className="px-2.5 py-2 bg-[#e9f0ea] hover:bg-[#cbdad0] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#0f1a14] dark:text-zinc-300 border border-[#cbdad0] dark:border-zinc-700 text-[11px] whitespace-nowrap active:scale-95 transition-all"
                title="Verify slug uniqueness in Firestore"
              >
                {slugChecking ? "Checking..." : "Verify"}
              </button>
            </div>
            {slugStatus?.message && (
              <p
                className={`text-[10px] mt-0.5 ${
                  slugStatus.state === "available"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {slugStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Excerpt & Publishing Controls Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#cbdad0] dark:border-zinc-800/80">
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="blog-excerpt" className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
                Short Excerpt / Teaser (Displayed on Cards &amp; Social Cards) *
              </label>
              <span className={`text-[10px] ${excerpt.length > 250 ? "text-amber-600 dark:text-amber-400" : "text-[#6e8276] dark:text-zinc-500"}`}>
                {excerpt.length} / 250 chars
              </span>
            </div>
            <textarea
              id="blog-excerpt"
              rows="2"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setIsDirty(true);
              }}
              placeholder="A concise, punchy 1-2 sentence overview of the article..."
              className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-700 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-1.5 text-[#0f1a14] dark:text-zinc-200 placeholder-[#6e8276] dark:placeholder-zinc-500 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
              Publishing Status
            </span>
            <div className="p-2.5 bg-[#f4f7f4] dark:bg-zinc-900/80 border border-[#cbdad0] dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#4b5e53] dark:text-zinc-400">Current State:</span>
                <StatusPill
                  status={published ? "PUBLISHED" : "DRAFT"}
                  variant={published ? "terminal" : "outline"}
                />
              </div>

              {/* Toggle draft/published */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#cbdad0] dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setPublished(!published);
                    setIsDirty(true);
                  }}
                  className={`w-full py-1 px-2 border text-[11px] font-bold text-center transition-all ${
                    published
                      ? "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                      : "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  }`}
                >
                  {published ? "Switch to Draft Mode" : "Switch to Published Mode"}
                </button>
              </div>

              {publishedAt && (
                <div className="text-[10px] text-[#6e8276] dark:text-zinc-500 pt-0.5">
                  Published: {publishedAt?.toDate ? publishedAt.toDate().toLocaleDateString() : "Active"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Cover Banner Image & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#cbdad0] dark:border-zinc-800/80">
          {/* Cover Banner Uploader / Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#0f1a14] dark:text-zinc-300 font-bold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-cyan" />
                Cover Banner Image
              </span>
              <button
                type="button"
                onClick={() => setShowCoverUploader(!showCoverUploader)}
                className="text-[11px] text-emerald-700 dark:text-terminal-cyan hover:underline flex items-center gap-1"
              >
                {showCoverUploader ? (
                  <>Hide Uploader <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>
                    {coverImageUrl ? "Replace Banner" : "+ Upload Banner"} <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* Display Cover Banner Preview if URL exists */}
            {coverImageUrl && !showCoverUploader && (
              <div className="relative group aspect-video max-h-24 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt="Article Cover Banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl("");
                    setCoverImagePublicId("");
                    setIsDirty(true);
                  }}
                  className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/80 hover:bg-rose-900 text-zinc-300 hover:text-white border border-zinc-700 text-[10px]"
                  title="Remove cover banner"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Full ImageUploader when expanded or when no cover image */}
            {(showCoverUploader || !coverImageUrl) && (
              <ImageUploader
                folder="portfolio/blogs/covers"
                value={coverImageUrl}
                label=""
                onUploadSuccess={({ secure_url, url, public_id }) => {
                  setCoverImageUrl(secure_url || url);
                  setCoverImagePublicId(public_id);
                  setIsDirty(true);
                  setShowCoverUploader(false);
                }}
                onRemove={() => {
                  setCoverImageUrl("");
                  setCoverImagePublicId("");
                  setIsDirty(true);
                }}
              />
            )}
          </div>

          {/* Tags Manager with suggestions */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#0f1a14] dark:text-zinc-300 font-bold">Tags / Categories</span>
              <span className="text-[11px] text-[#6e8276] dark:text-zinc-500">{tags.length} selected</span>
            </div>

            <div className="flex items-center gap-1.5">
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
                placeholder="Type tag and press Enter..."
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-green px-2.5 py-1.5 text-[#0f1a14] dark:text-zinc-200 placeholder-[#6e8276] dark:placeholder-zinc-500 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-[#e9f0ea] text-[#0f1a14] hover:bg-[#cbdad0] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 border border-[#cbdad0] dark:border-zinc-700 text-xs"
              >
                Add
              </button>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-6">
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
              {tags.length === 0 && (
                <span className="text-[11px] text-[#6e8276] dark:text-zinc-600 italic">No tags selected. Add some below.</span>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#cbdad0] dark:border-zinc-800/60">
              <span className="text-[10px] text-[#6e8276] dark:text-zinc-500 mr-1">Suggestions:</span>
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setTags([...tags, suggestion]);
                    setIsDirty(true);
                  }}
                  className="px-1.5 py-0.5 bg-[#f4f7f4] hover:bg-[#e9f0ea] dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[#4b5e53] hover:text-[#0f1a14] dark:text-zinc-400 dark:hover:text-zinc-200 border border-[#cbdad0] dark:border-zinc-800 text-[10px] transition-colors"
                >
                  {`+ ${suggestion}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen Markdown Studio */}
      <TerminalBox
        title="split_markdown_editor.sh"
        className="border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal flex flex-col min-h-[650px] overflow-hidden"
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#cbdad0] dark:divide-zinc-800 h-[600px] overflow-hidden">
          {/* Left Pane: Editor */}
          {(viewMode === "split" || viewMode === "edit") && (
            <div
              onDragEnter={handleEditorDragOver}
              onDragOver={handleEditorDragOver}
              onDragLeave={handleEditorDragLeave}
              onDrop={handleEditorDrop}
              className={`relative flex flex-col h-full bg-[#f4f7f4] dark:bg-zinc-950 ${
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
              <div className="bg-[#e9f0ea] dark:bg-zinc-900/60 px-3 py-1.5 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-[#4b5e53] dark:text-zinc-400">
                <span className="font-bold flex items-center gap-1.5 text-[#0f1a14] dark:text-zinc-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-cyan" />
                  EDITOR (MARKDOWN SOURCE)
                </span>

                <div className="flex items-center gap-2">
                  {directUploadStatus?.isUploading ? (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-terminal-green text-[10px] animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Uploading {directUploadStatus.filename} ({directUploadStatus.progress}%)
                    </span>
                  ) : (
                    <span className="hidden sm:inline text-[10px] text-[#6e8276] dark:text-zinc-500">
                      Drag &amp; drop / Paste image directly
                    </span>
                  )}
                  <span className="text-[#cbdad0] dark:text-zinc-600">|</span>
                  <span>{lineCount} lines</span>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Line numbers gutter */}
                <div className="w-10 bg-[#e9f0ea]/50 dark:bg-zinc-900/40 border-r border-[#cbdad0] dark:border-zinc-800/80 py-4 select-none font-mono text-[11px] text-[#6e8276] dark:text-zinc-600 text-right pr-2 leading-6 overflow-hidden">
                  {Array.from({ length: Math.min(lineCount, 500) }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setIsDirty(true);
                  }}
                  onScroll={handleEditorScroll}
                  onPaste={handleTextareaPaste}
                  placeholder="# Write your technical post in Markdown here..."
                  aria-label="Markdown content input"
                  className="flex-1 p-4 bg-transparent text-[#0f1a14] dark:text-zinc-100 placeholder-[#6e8276] dark:placeholder-zinc-600 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-6 overflow-y-auto selection:bg-emerald-200 dark:selection:bg-terminal-green selection:text-[#0f1a14] dark:selection:text-black"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* Right Pane: Real-Time Preview */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`flex flex-col h-full bg-white dark:bg-zinc-950 ${viewMode === "preview" ? "lg:col-span-2" : ""}`}>
              <div className="bg-[#e9f0ea] dark:bg-zinc-900/60 px-3 py-1.5 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-[#4b5e53] dark:text-zinc-400">
                <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-terminal-green">
                  <Sparkles className="w-3.5 h-3.5" />
                  LIVE PREVIEW (GFM RENDERED)
                </span>
                <span className="text-[10px] text-[#6e8276] dark:text-zinc-500 uppercase">
                  {published ? "Status: Published" : "Status: Draft"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
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
