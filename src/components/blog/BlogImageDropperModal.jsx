import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Link2,
  Sparkles,
} from "lucide-react";
import {
  uploadToCloudinary,
  validateImageFile,
  getOptimizedImageUrl,
} from "../../services/cloudinary.js";
import { BrutalButton, TagBadge } from "../brutalist";

/**
 * Converts a raw filename into a human-readable Alt Text.
 * e.g. "my_system-diagram_v2.png" -> "My system diagram v2"
 */
export function filenameToAltText(filename = "") {
  if (!filename || typeof filename !== "string") return "";
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const spaced = nameWithoutExt.replace(/[-_]+/g, " ").trim();
  if (!spaced) return "";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Formats Markdown image insertion snippet.
 */
export function formatMarkdownImage(alt = "", url = "", caption = "") {
  const safeAlt = (alt || "Image").trim();
  const safeUrl = (url || "").trim();
  const safeCaption = (caption || "").trim();
  if (safeCaption) {
    return `![${safeAlt}](${safeUrl} "${safeCaption}")`;
  }
  return `![${safeAlt}](${safeUrl})`;
}

/**
 * BlogImageDropperModal - Neo-Brutalist Cloudinary Asset Dropper & Inserter
 */
export default function BlogImageDropperModal({
  isOpen,
  onClose,
  onInsertImage,
  initialAltText = "",
  folder = "portfolio/blogs",
}) {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "url"
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadMetadata, setUploadMetadata] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Metadata form fields
  const [altText, setAltText] = useState(initialAltText || "");
  const [caption, setCaption] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Reset state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("upload");
      setSelectedFile(null);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setPreviewUrl("");
      setUploadedUrl("");
      setUploadMetadata(null);
      setProgress(0);
      setIsUploading(false);
      setErrorMessage("");
      setCaption("");
      setExternalUrl("");
      setAltText(initialAltText || "");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, initialAltText]);

  // Clean up object URLs and abort controllers strictly on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isUploading) {
        handleModalClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUploading]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (isUploading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setErrorMessage("");
    setProgress(0);
    setIsUploading(false);
    onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setErrorMessage("");
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    blobUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setUploadedUrl("");
    setUploadMetadata(null);

    // If alt text is empty, auto-generate from file name
    if (!altText.trim()) {
      setAltText(filenameToAltText(file.name));
    }

    executeUpload(file);
  };

  const executeUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsUploading(true);
    setProgress(0);
    setErrorMessage("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await uploadToCloudinary(
        file,
        folder,
        (percent) => setProgress(percent),
        { signal: controller.signal }
      );

      abortControllerRef.current = null;
      setUploadedUrl(result.secure_url || result.url);
      setUploadMetadata(result);
      setIsUploading(false);
      setProgress(100);
    } catch (err) {
      abortControllerRef.current = null;
      setIsUploading(false);
      if (err.name !== "AbortError") {
        setErrorMessage(
          err.message || "Cloudinary upload failed. Please verify your internet connection and retry."
        );
      }
    }
  };

  const handleInsert = (e) => {
    if (e) e.preventDefault();
    const finalUrl = activeTab === "upload" ? uploadedUrl : externalUrl.trim();

    if (!finalUrl) {
      setErrorMessage("Please wait for the image to finish uploading to Cloudinary.");
      return;
    }

    const fallbackAlt = selectedFile?.name ? filenameToAltText(selectedFile.name) : "Image";

    onInsertImage({
      url: finalUrl,
      altText: altText.trim() || fallbackAlt,
      caption: caption.trim(),
      public_id: uploadMetadata?.public_id,
      delete_token: uploadMetadata?.delete_token,
    });

    handleModalClose();
  };

  const targetUrl = activeTab === "upload" ? uploadedUrl : externalUrl.trim();
  const canInsert = Boolean(targetUrl && !isUploading);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-[#0f1a14] dark:text-zinc-100 font-mono">
        {/* Terminal Header */}
        <div className="bg-[#e9f0ea] dark:bg-zinc-900 px-4 py-2.5 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-terminal-cyan rounded-full animate-pulse" />
            <span id="image-modal-title" className="font-bold text-[#0f1a14] dark:text-zinc-200">
              sys.media.cloudinary_dropper.sh
            </span>
            <span className="text-[#cbdad0] dark:text-zinc-600">|</span>
            <span className="text-[11px] text-[#4b5e53] dark:text-zinc-400">{`folder: ${folder}`}</span>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            disabled={isUploading}
            aria-label="Close modal"
            className="text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-white p-1 hover:bg-[#cbdad0]/50 dark:hover:bg-zinc-800 border border-transparent hover:border-[#cbdad0] dark:hover:border-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#cbdad0] dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2.5 px-4 font-bold flex items-center justify-center gap-2 border-r border-[#cbdad0] dark:border-zinc-800 transition-colors ${
              activeTab === "upload"
                ? "bg-[#e9f0ea] dark:bg-zinc-900 text-emerald-700 dark:text-terminal-green border-b-2 border-b-emerald-600 dark:border-b-terminal-green"
                : "bg-white dark:bg-zinc-950 text-[#6e8276] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-300"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload via Cloudinary</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-2.5 px-4 font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "url"
                ? "bg-[#e9f0ea] dark:bg-zinc-900 text-emerald-700 dark:text-terminal-cyan border-b-2 border-b-emerald-600 dark:border-b-terminal-cyan"
                : "bg-white dark:bg-zinc-950 text-[#6e8276] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-300"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>External Image URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleInsert} className="p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === "upload" ? (
            /* Cloudinary Dropzone Tab */
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed p-5 transition-colors text-center ${
                  dragActive
                    ? "border-emerald-600 dark:border-terminal-green bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-[#cbdad0] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-900/60 hover:border-emerald-600 dark:hover:border-zinc-700"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,image/avif,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  onClick={(e) => {
                    e.target.value = null;
                  }}
                />

                {previewUrl ? (
                  /* Image Preview & Upload Status */
                  <div className="space-y-3">
                    <div className="relative w-full aspect-video max-h-48 bg-[#e9f0ea] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                      <img
                        src={getOptimizedImageUrl(previewUrl, { width: 600 })}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#4b5e53] dark:text-zinc-400">
                          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-terminal-green">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Ingesting to Cloudinary ({folder})...
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#cbdad0] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 dark:bg-terminal-green transition-all duration-150"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Succeeded via Cloudinary */}
                    {uploadedUrl && !isUploading && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          CDN Asset Ready
                        </span>
                        <div className="flex gap-1.5">
                          {uploadMetadata?.format && (
                            <TagBadge variant="terminal" size="sm">
                              {uploadMetadata.format.toUpperCase()}
                            </TagBadge>
                          )}
                          {uploadMetadata?.width && (
                            <TagBadge variant="cyan" size="sm">
                              {uploadMetadata.width}x{uploadMetadata.height}
                            </TagBadge>
                          )}
                        </div>
                      </div>
                    )}


                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-200 underline"
                      >
                        Choose a different image
                      </button>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="py-4 space-y-2">
                    <div className="w-10 h-10 mx-auto bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 flex items-center justify-center text-[#4b5e53] dark:text-zinc-400">
                      <UploadCloud className="w-5 h-5 text-[#2c3e34] dark:text-zinc-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0f1a14] dark:text-zinc-200">
                        Drag and drop your image here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-emerald-700 dark:text-terminal-green underline hover:text-emerald-800 dark:hover:text-emerald-300"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-[11px] text-[#6e8276] dark:text-zinc-500 mt-0.5">
                        JPG, PNG, WEBP, GIF, SVG up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* External URL Tab */
            <div className="space-y-2">
              <label htmlFor="external-img-url" className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
                Image CDN / Web URL *
              </label>
              <input
                id="external-img-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-cyan px-3 py-2 text-[#0f1a14] dark:text-zinc-200 placeholder-[#6e8276] dark:placeholder-zinc-500 focus:outline-none"
              />
              {externalUrl && (
                <div className="relative w-full aspect-video max-h-36 bg-[#e9f0ea] dark:bg-zinc-950 border border-[#cbdad0] dark:border-zinc-800 overflow-hidden flex items-center justify-center mt-2">
                  <img
                    src={externalUrl}
                    alt="External Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Metadata: Alt Text & Caption */}
          <div className="space-y-3 pt-2 border-t border-[#cbdad0] dark:border-zinc-800">
            <div className="space-y-1">
              <label htmlFor="modal-alt-text" className="block text-[#0f1a14] dark:text-zinc-300 font-bold">
                Alt Text / Description (Required for Accessibility) *
              </label>
              <input
                id="modal-alt-text"
                type="text"
                required
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Distributed Database Topology Diagram"
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-200 placeholder-[#6e8276] dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="modal-caption" className="block text-[#4b5e53] dark:text-zinc-400">
                Optional Caption / Hover Title
              </label>
              <input
                id="modal-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Figure 1.2: System Architecture overview"
                className="w-full bg-[#f4f7f4] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-terminal-green px-3 py-2 text-[#0f1a14] dark:text-zinc-300 placeholder-[#6e8276] dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Error Message with Recovery Actions */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {selectedFile && !isUploading && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={() => executeUpload(selectedFile)}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Cloudinary Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#cbdad0] dark:border-zinc-800">
            <BrutalButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleModalClose}
              disabled={isUploading}
            >
              Cancel
            </BrutalButton>

            <BrutalButton
              type="submit"
              variant="terminal"
              size="sm"
              disabled={!canInsert}
              loading={isUploading}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Insert Image Markdown
            </BrutalButton>
          </div>
        </form>
      </div>
    </div>
  );
}

BlogImageDropperModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onInsertImage: PropTypes.func.isRequired,
  initialAltText: PropTypes.string,
  folder: PropTypes.string,
};
