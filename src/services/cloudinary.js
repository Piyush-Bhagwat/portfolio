/**
 * Cloudinary Media Service
 * Handles client-side validation, direct unsigned uploads, and CDN URL transformations.
 */

const getEnvVar = (key, fallback = "") => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  const proc = typeof globalThis !== "undefined" ? globalThis.process : undefined;
  if (proc && proc.env && proc.env[key]) {
    return proc.env[key];
  }
  return fallback;
};

export const CLOUDINARY_CONFIG = {
  cloudName: getEnvVar("VITE_CLOUDINARY_CLOUD_NAME", ""),
  uploadPreset: getEnvVar("VITE_CLOUDINARY_UPLOAD_PRESET", "portfolio_unsigned"),
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  uploadTimeoutMs: 30000, // 30 seconds
  defaultPlaceholder: "/assets/placeholders/terminal-placeholder.png",
};

/**
 * Validates a file's MIME type and size prior to network transmission.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided for upload." };
  }

  if (!CLOUDINARY_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type || "unknown"}. Only JPG, PNG, WEBP, GIF, and SVG are supported.`,
    };
  }

  if (file.size > CLOUDINARY_CONFIG.maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMB}MB). Maximum allowed size is 5MB.`,
    };
  }

  return { valid: true };
}

/**
 * Directly uploads an image file to Cloudinary unsigned preset with real-time progress.
 *
 * @param {File} file - File object to upload
 * @param {string} [folder="portfolio"] - Destination folder in Cloudinary
 * @param {Function} [onProgress] - Optional callback (percent: number) => void
 * @param {Object} [options] - Optional overrides (cloudName, uploadPreset, signal)
 * @returns {Promise<{
 *   url: string,
 *   secure_url: string,
 *   public_id: string,
 *   width: number,
 *   height: number,
 *   format: string,
 *   bytes: number
 * }>}
 */
export function uploadToCloudinary(file, folder = "portfolio", onProgress, options = {}) {
  return new Promise((resolve, reject) => {
    // 1. Client-side inspection
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const cloudName = options.cloudName || CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = options.uploadPreset || CLOUDINARY_CONFIG.uploadPreset;

    if (!cloudName) {
      return reject(
        new Error(
          "Cloudinary cloud name is missing. Please set VITE_CLOUDINARY_CLOUD_NAME in your environment."
        )
      );
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (folder) {
      formData.append("folder", folder);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.timeout = options.timeoutMs || CLOUDINARY_CONFIG.uploadTimeoutMs;

    // Progress event listener
    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    // Abort controller integration
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Upload aborted by user", "AbortError"));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url || response.url,
            secure_url: response.secure_url || response.url,
            public_id: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
            bytes: response.bytes,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        let errorMsg = `Upload failed with HTTP status ${xhr.status}`;
        try {
          const errRes = JSON.parse(xhr.responseText);
          if (errRes.error?.message) {
            errorMsg = errRes.error.message;
          }
        } catch {
          // ignore parsing error
        }
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error during upload. Please check your internet."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Upload timed out after 30 seconds. Please check your network connection and retry."));
    };

    xhr.onabort = () => {
      reject(new DOMException("Upload was canceled.", "AbortError"));
    };

    xhr.send(formData);
  });
}

/**
 * Constructs an optimized Cloudinary delivery URL with dynamic WebP/AVIF transformation
 * and custom sizing.
 *
 * @param {string} url - Original image URL
 * @param {Object} [options]
 * @param {number} [options.width] - Resized width (px)
 * @param {number} [options.height] - Resized height (px)
 * @param {'fill' | 'scale' | 'fit' | 'thumb' | 'crop'} [options.crop='fill'] - Crop mode
 * @param {string} [options.format='auto'] - Output format (auto = WebP/AVIF depending on browser)
 * @param {string | number} [options.quality='auto'] - Quality compression
 * @returns {string} Transformed or original URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== "string") {
    return CLOUDINARY_CONFIG.defaultPlaceholder;
  }

  // If not hosted on Cloudinary, return the original URL as-is
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    format = "auto",
    quality = "auto",
  } = options;

  const transforms = [];

  if (crop && (width || height)) {
    transforms.push(`c_${crop}`);
  }
  if (width) {
    transforms.push(`w_${Math.round(width)}`);
  }
  if (height) {
    transforms.push(`h_${Math.round(height)}`);
  }
  if (format) {
    transforms.push(`f_${format}`);
  }
  if (quality) {
    transforms.push(`q_${quality}`);
  }

  if (transforms.length === 0) {
    transforms.push("f_auto", "q_auto");
  }

  const transformString = transforms.join(",");

  // Check if URL already contains transforms after /image/upload/
  // Format: .../image/upload/[existing_transforms/]v12345/public_id.jpg
  const uploadMarker = "/image/upload/";
  const parts = url.split(uploadMarker);

  if (parts.length !== 2) {
    return url;
  }

  // If the URL already contains the exact transform string, return as-is
  if (parts[1].startsWith(`${transformString}/`)) {
    return url;
  }

  // Check if parts[1] already starts with a transformation segment
  const firstSlashIndex = parts[1].indexOf("/");
  if (firstSlashIndex !== -1) {
    const firstSegment = parts[1].slice(0, firstSlashIndex);
    const isTransformSegment = /^[a-z]{1,4}_/.test(firstSegment) && !/^v\d+$/.test(firstSegment);
    if (isTransformSegment) {
      if (transforms.length === 2 && transforms.includes("f_auto") && transforms.includes("q_auto")) {
        return url;
      }
      return `${parts[0]}${uploadMarker}${transformString}/${parts[1].slice(firstSlashIndex + 1)}`;
    }
  }

  return `${parts[0]}${uploadMarker}${transformString}/${parts[1]}`;
}
