import React from 'react';

/**
 * Standard Indian culinary Veg / Non-Veg badge with authentic square + dot/triangle symbol
 */
export const VegNonVegBadge = ({ type = 'veg', showLabel = true, size = 'md' }) => {
  const isVeg = type.toLowerCase() === 'veg';

  const containerSizes = {
    sm: 'w-4 h-4 p-[2px]',
    md: 'w-5 h-5 p-[3px]',
    lg: 'w-6 h-6 p-[4px]',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`border-2 rounded flex items-center justify-center ${
          isVeg
            ? 'border-emerald-600 bg-white'
            : 'border-red-600 bg-white'
        } ${containerSizes[size] || containerSizes.md}`}
        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        {isVeg ? (
          <span className={`rounded-full bg-emerald-600 ${dotSizes[size] || dotSizes.md}`} />
        ) : (
          <span
            className="w-0 h-0 border-solid"
            style={{
              borderLeftWidth: size === 'sm' ? '3px' : '4px',
              borderRightWidth: size === 'sm' ? '3px' : '4px',
              borderBottomWidth: size === 'sm' ? '6px' : '8px',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#dc2626',
            }}
          />
        )}
      </div>
      {showLabel && (
        <span
          className={`font-bold tracking-wider uppercase text-xs ${
            isVeg ? 'text-emerald-700' : 'text-red-700'
          }`}
        >
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};

export default VegNonVegBadge;
