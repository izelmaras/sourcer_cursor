import React, { useState } from 'react';
import { normalizeUrl } from '../../lib/utils';

interface VideoThumbnailProps {
  src: string;
  seek?: number; // seconds
  alt?: string;
  className?: string;
  onThumbnail?: (dataUrl: string) => void;
  fallbackIcon?: React.ReactNode;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  alt = 'Video',
  className = '',
  onThumbnail,
  fallbackIcon,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize the source URL (handle protocol-relative URLs)
  const normalizedSrc = src ? normalizeUrl(src) : '';

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallbackIcon || (
          <div className="text-gray-400 text-sm">No video</div>
        )}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-2">
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div className="text-xs text-gray-500">Video</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
      <video
        src={normalizedSrc}
        className={`object-cover ${className}`}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          setIsLoading(false);
          // Call onThumbnail with the video src as a simple identifier
          onThumbnail?.(normalizedSrc);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};