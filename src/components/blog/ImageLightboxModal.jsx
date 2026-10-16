import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  X,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";

/**
 * ImageLightboxModal - Neo-Brutalist Fullscreen Lightbox with Zoom, Pan & Keyboard Navigation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the lightbox is actively displayed
 * @param {{ src: string, alt?: string, caption?: string }} [props.image] - Target image object
 * @param {Function} props.onClose - Callback triggered to dismiss lightbox
 */
export default function ImageLightboxModal({ isOpen, image, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
  const imageRef = useRef(null);

  // Reset zoom & pan when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, image?.src]);

  // Lock body scroll when lightbox is mounted/opened
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, zoom]);

  if (!isOpen || !image || !image.src) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 0.5);
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleZoom = (e) => {
    e.stopPropagation();
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleResetZoom();
    }
  };

  // Mouse wheel scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Panning interaction (only active when zoomed in)
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomPercentage = Math.round(zoom * 100);
  const altDisplay = image.caption || image.alt || "Article illustration";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Fullscreen Lightbox"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md font-mono select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Lightbox Top Header Toolbar */}
      <div
        className="shrink-0 bg-[#0f1a14]/90 border-b border-[#2c3e34] dark:border-zinc-800 px-4 py-3 flex items-center justify-between text-zinc-100 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header Dots & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <span className="text-xs text-emerald-400 font-bold truncate max-w-[200px] sm:max-w-md">
            sys.media.fullscreen_viewer
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-xs text-zinc-400 truncate max-w-xs">
            {altDisplay}
          </span>
        </div>

        {/* Action Controls: Zoom Out, Percentage, Zoom In, Reset, External, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out (-)"
            aria-label="Zoom out"
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-95"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Percentage / Reset Button */}
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom to 100% (0)"
            aria-label="Reset zoom"
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-emerald-400 font-bold flex items-center gap-1 min-w-[58px] justify-center transition-colors active:scale-95"
          >
            <span>{zoomPercentage}%</span>
            {zoom !== 1 && <RotateCcw className="w-3 h-3 text-zinc-400" />}
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            title="Zoom In (+)"
            aria-label="Zoom in"
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-95"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-800 mx-1 hidden sm:inline" />

          {/* Open original image in new tab */}
          <a
            href={image.src}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original image in new tab"
            aria-label="Open original image"
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors active:scale-95 hidden sm:inline-flex"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close Lightbox Button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Lightbox (Esc)"
            aria-label="Close fullscreen view"
            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white transition-colors active:scale-95 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 ${
          zoom > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in"
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="inline-block max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleToggleZoom}
        >
          <img
            ref={imageRef}
            src={image.src}
            alt={altDisplay}
            draggable={false}
            className="max-w-[90vw] max-h-[75vh] object-contain border-2 border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] pointer-events-auto"
          />
        </div>
      </div>

      {/* Lightbox Footer Bar: Alt Caption & Keyboard Shortcuts Guide */}
      <div
        className="shrink-0 bg-[#0f1a14]/90 border-t border-[#2c3e34] dark:border-zinc-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 truncate max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-zinc-200 truncate">{altDisplay}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500 shrink-0">
          <span className="hidden md:inline">[Scroll / + -] Zoom</span>
          <span className="hidden md:inline">&bull;</span>
          <span className="hidden md:inline">[Double Click] Toggle 2x</span>
          <span className="hidden md:inline">&bull;</span>
          {zoom > 1 && (
            <>
              <span className="text-emerald-400 font-bold">[Drag] Pan Image</span>
              <span>&bull;</span>
            </>
          )}
          <span>[Esc] Close</span>
        </div>
      </div>
    </div>
  );
}

ImageLightboxModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  image: PropTypes.shape({
    src: PropTypes.string,
    alt: PropTypes.string,
    caption: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};
