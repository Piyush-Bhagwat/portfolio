import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import {
  uploadToCloudinary,
  validateImageFile,
  getOptimizedImageUrl,
} from "../../services/cloudinary";
import { BrutalButton, TagBadge } from "../brutalist";

/**
 * ImageUploader - Neo-Brutalist image uploader with drag-and-drop,
 * real-time progress bar, instant local preview, and Cloudinary upload.
 *
 * @param {Object} props
 * @param {string} [props.folder="portfolio"] - Cloudinary destination folder
 * @param {string} [props.value] - Existing image URL if editing
 * @param {Function} [props.onUploadSuccess] - Callback ({ url, public_id, width, height, format }) => void
 * @param {Function} [props.onRemove] - Callback when image is cleared
 * @param {string} [props.label="Upload Image"]
 * @param {string} [props.className]
 */
export default function ImageUploader({
  folder = "portfolio",
  value,
  onUploadSuccess,
  onRemove,
  label = "Upload Image",
  className = "",
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(value || "");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync with incoming external value if provided
  useEffect(() => {
    if (value && !selectedFile) {
      setLocalPreview(value);
    }
  }, [value, selectedFile]);

  // Clean up object URL when file changes or unmounts
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [localPreview]);

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

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploadResult(null);

    // Automatically initiate upload upon selection
    executeUpload(file);
  };

  const executeUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

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

      setUploadResult(result);
      setIsUploading(false);
      setProgress(100);

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      setIsUploading(false);
      if (err.name !== "AbortError") {
        setErrorMessage(err.message || "Failed to upload image. Please retry.");
      }
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setSelectedFile(null);
    setLocalPreview("");
    setProgress(0);
    setIsUploading(false);
    setUploadResult(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleCopyUrl = async () => {
    const urlToCopy = uploadResult?.secure_url || localPreview;
    if (!urlToCopy) return;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className={`space-y-3 font-mono ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold tracking-wide">
          <span>{label}</span>
          {folder && (
            <span className="text-[11px] text-zinc-500 font-normal">
              folder: {folder}
            </span>
          )}
        </div>
      )}

      {/* Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed p-6 transition-colors duration-150 rounded-none
          ${
            dragActive
              ? "border-emerald-400 bg-emerald-950/20"
              : "border-zinc-800 bg-[#121215] hover:border-zinc-700"
          }
        `.trim()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />

        {localPreview ? (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="relative group w-full aspect-video md:aspect-[21/9] max-h-64 bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={getOptimizedImageUrl(localPreview, { width: 800 })}
                alt="Upload preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%2318181b%22%20width%3D%22400%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%2371717a%22%20font-family%3D%22monospace%22%20font-size%3D%2214%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EPreview%20Unavailable%3C%2Ftext%3E%3C%2Fsvg%3E";
                }}
              />
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-2 right-2 p-1.5 bg-zinc-900/90 hover:bg-rose-900 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading to Cloudinary...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-terminal-green transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Succeeded Metadata & Actions */}
            {uploadResult && !isUploading && (
              <div className="p-3 bg-zinc-900/70 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Uploaded Successfully
                  </span>
                  <div className="flex gap-1.5">
                    <TagBadge variant="terminal" size="sm">
                      {uploadResult.format?.toUpperCase()}
                    </TagBadge>
                    {uploadResult.width && (
                      <TagBadge variant="cyan" size="sm">
                        {uploadResult.width}x{uploadResult.height}
                      </TagBadge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={uploadResult.secure_url}
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-zinc-300 font-mono select-all focus:outline-none"
                  />
                  <BrutalButton
                    size="sm"
                    variant="outline"
                    onClick={handleCopyUrl}
                    icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? "Copied" : "Copy"}
                  </BrutalButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Drop Target State */
          <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400">
              <UploadCloud className="w-6 h-6 text-zinc-300" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-200">
                Drag and drop your image here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-400 underline hover:text-emerald-300 focus:outline-none"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-zinc-500">
                Supports JPG, PNG, WEBP, GIF, SVG (up to 5MB)
              </p>
            </div>

            <BrutalButton
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              icon={<ImageIcon className="w-3.5 h-3.5" />}
            >
              Select Image
            </BrutalButton>
          </div>
        )}
      </div>

      {/* Error Feedback with Retry */}
      {errorMessage && (
        <div className="flex items-start justify-between gap-3 p-3 bg-rose-950/40 border border-rose-600/50 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {selectedFile && !isUploading && (
            <BrutalButton
              size="sm"
              variant="danger"
              onClick={() => executeUpload(selectedFile)}
              icon={<RefreshCw className="w-3 h-3" />}
            >
              Retry
            </BrutalButton>
          )}
        </div>
      )}
    </div>
  );
}
