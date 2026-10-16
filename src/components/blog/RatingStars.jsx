import { useState } from "react";
import PropTypes from "prop-types";
import { Star } from "lucide-react";

const RATING_DESCRIPTIONS = {
  1: "1 / 5 - Poor",
  2: "2 / 5 - Fair",
  3: "3 / 5 - Good",
  4: "4 / 5 - Very Good",
  5: "5 / 5 - Exceptional",
};

/**
 * RatingStars - Dual-Mode Neo-Brutalist Star Rating Component
 *
 * Supports both:
 * 1. Display-only mode (read-only fractional/integer stars)
 * 2. Interactive mode (1 to 5 clickable stars with hover previews and keyboard accessibility)
 */
export default function RatingStars({
  rating = 5,
  interactive = false,
  onChange,
  size = "md",
  showLabel = false,
  disabled = false,
  className = "",
}) {
  const [hoverRating, setHoverRating] = useState(null);

  const numericRating = Number(rating) || 0;
  const activeRating = interactive && hoverRating !== null ? hoverRating : numericRating;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const starIconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex flex-col gap-1 font-mono ${className}`}>
      <div
        className="flex items-center gap-1 select-none"
        onMouseLeave={() => {
          if (interactive && !disabled) {
            setHoverRating(null);
          }
        }}
        role={interactive ? "radiogroup" : "img"}
        aria-label={
          interactive
            ? "Rate this technical publication"
            : `Rating: ${numericRating.toFixed(1)} out of 5 stars`
        }
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= Math.round(activeRating);
          const isSelected = starValue === numericRating;

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${starValue} of 5 stars`}
                disabled={disabled}
                onClick={() => {
                  if (!disabled && onChange) {
                    onChange(starValue);
                  }
                }}
                onMouseEnter={() => {
                  if (!disabled) {
                    setHoverRating(starValue);
                  }
                }}
                onFocus={() => {
                  if (!disabled) {
                    setHoverRating(starValue);
                  }
                }}
                onBlur={() => {
                  if (!disabled) {
                    setHoverRating(null);
                  }
                }}
                className={`
                  p-1 -m-1 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-none
                  ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110 active:scale-95"}
                `}
              >
                <Star
                  className={`
                    ${starIconSize} transition-colors
                    ${
                      isFilled
                        ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 drop-shadow-[0px_0px_2px_rgba(245,158,11,0.5)]"
                        : "text-[#cbdad0] dark:text-zinc-700 hover:text-amber-400/80"
                    }
                  `}
                />
              </button>
            );
          }

          // Display-only mode
          return (
            <Star
              key={starValue}
              className={`
                ${starIconSize}
                ${
                  isFilled
                    ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                    : "text-[#cbdad0] dark:text-zinc-700"
                }
              `}
            />
          );
        })}
      </div>

      {/* Optional Descriptive Label */}
      {showLabel && activeRating > 0 && (
        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold tracking-tight">
          {RATING_DESCRIPTIONS[Math.round(activeRating)] || `${activeRating.toFixed(1)} / 5`}
        </span>
      )}
    </div>
  );
}

RatingStars.propTypes = {
  rating: PropTypes.number,
  interactive: PropTypes.bool,
  onChange: PropTypes.func,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showLabel: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
