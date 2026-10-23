import React, { useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  fallbackBg?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  fallbackBg = '#E5E2CE',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center p-4 select-none overflow-hidden ${className}`}
        style={{ backgroundColor: fallbackBg, color: '#384A22' }}
        role="img"
        aria-label={alt || fallbackLabel || 'Botenz product'}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-10 h-10 mb-2 opacity-75"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="16" y="14" width="32" height="40" rx="6" />
          <path d="M14 14h36M20 8h24v6H20z" />
          <circle cx="32" cy="34" r="8" />
        </svg>
        <span className="text-xs font-semibold tracking-tight line-clamp-2">
          {fallbackLabel || alt || 'Botenz Natural Nut Powder'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Botenz image'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
