'use client';

import { useState } from 'react';

// Simple star icons as SVG components
const StarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const StarOutlineIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  readonly?: boolean;
  showCount?: boolean;
  count?: number;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
};

const StarRating = ({
  rating = 0,
  onRatingChange,
  size = 'md',
  showLabel = false,
  label,
  readonly = false,
  showCount = false,
  count = 0
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleStarClick = (starRating: number) => {
    if (readonly) return;
    
    setCurrentRating(starRating);
    onRatingChange?.(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoverRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || currentRating || rating;

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'No rating';
    if (rating <= 1) return 'Poor';
    if (rating <= 2) return 'Fair';
    if (rating <= 3) return 'Good';
    if (rating <= 4) return 'Very Good';
    return 'Excellent';
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`flex items-center gap-0.5 ${!readonly ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isPartial = star - 0.5 <= displayRating && star > displayRating;
          
          return (
            <div
              key={star}
              className="relative"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            >
              {isFilled ? (
                <StarIcon 
                  className={`${sizeClasses[size]} text-yellow-400 ${!readonly ? 'hover:text-yellow-500 transition-colors' : ''}`} 
                />
              ) : isPartial ? (
                <div className="relative">
                  <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: '50%' }}
                  >
                    <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                  </div>
                </div>
              ) : (
                <StarOutlineIcon 
                  className={`${sizeClasses[size]} text-gray-300 ${!readonly ? 'hover:text-yellow-400 transition-colors' : ''}`} 
                />
              )}
            </div>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-sm text-gray-600">
          {label || getRatingText(displayRating)}
        </span>
      )}

      {showCount && count > 0 && (
        <span className="text-sm text-gray-500">
          ({count.toLocaleString()})
        </span>
      )}

      {!readonly && hoverRating > 0 && (
        <span className="text-sm text-gray-600 font-medium">
          {getRatingText(hoverRating)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 