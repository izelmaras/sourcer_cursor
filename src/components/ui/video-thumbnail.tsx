import React, { useState, useEffect, useRef } from 'react';
import { normalizeUrl, isValidUrl } from '../../lib/utils';

interface VideoThumbnailProps {
  src: string;
  seek?: number; // seconds
  alt?: string;
  className?: string;
  onThumbnail?: (dataUrl: string) => void;
  fallbackIcon?: React.ReactNode;
  onVideoDimensions?: (width: number, height: number) => void;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  alt = 'Video',
  className = '',
  onThumbnail,
  fallbackIcon,
  onVideoDimensions,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [tryWithoutCors, setTryWithoutCors] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Normalize the source URL (handle protocol-relative URLs)
  const normalizedSrc = src ? normalizeUrl(src) : '';
  const urlIsValid = src ? isValidUrl(normalizedSrc) : false;

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallbackIcon || (
          <div className="text-gray-400 text-sm">No video</div>
        )}
      </div>
    );
  }

  // If URL is invalid, show error immediately
  if (!urlIsValid) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-2">
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-xs text-gray-500">Invalid video URL</div>
        </div>
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

  // Reset error state when src changes
  useEffect(() => {
    isMountedRef.current = true;
    setHasError(false);
    setIsLoading(true);
    setVideoAspectRatio(null);
    setTryWithoutCors(false);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [normalizedSrc]);

  // Set up timeout for loading
  useEffect(() => {
    if (!normalizedSrc || hasError) return;
    
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (isLoading && !tryWithoutCors) {
        // If still loading and haven't tried without CORS, try that
        setTryWithoutCors(true);
        if (videoRef.current) {
          videoRef.current.removeAttribute('crossorigin');
          videoRef.current.load();
        }
      } else if (isLoading) {
        // If still loading after trying both methods, show error
        setIsLoading(false);
        setHasError(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
  }, [normalizedSrc, isLoading, hasError, tryWithoutCors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
      <video
        ref={videoRef}
        src={urlIsValid ? normalizedSrc : undefined}
        className={`w-full h-auto max-h-[400px] object-contain transition-transform duration-300 ${className}`}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        crossOrigin={tryWithoutCors ? undefined : "anonymous"}
        onLoadedMetadata={(e) => {
          try {
            setIsLoading(false);
            setHasError(false);
            const video = e.currentTarget;
            
            // Validate video dimensions
            if (!video.videoWidth || !video.videoHeight || video.videoHeight === 0) {
              throw new Error('Invalid video dimensions');
            }
            
            // Store aspect ratio for horizontal videos
            const aspectRatio = video.videoWidth / video.videoHeight;
            setVideoAspectRatio(aspectRatio);
            
            // Calculate and notify parent of video dimensions for horizontal videos
            if (onVideoDimensions && aspectRatio > 1 && containerRef.current) {
              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              // Use a small delay to ensure container width is available
              timeoutRef.current = setTimeout(() => {
                try {
                  // Check if component is still mounted and refs are valid
                  if (!isMountedRef.current || !containerRef.current || !video.videoWidth || !video.videoHeight) {
                    return;
                  }
                  const containerWidth = containerRef.current.offsetWidth || containerRef.current.clientWidth;
                  if (containerWidth > 0) {
                    const calculatedHeight = containerWidth / aspectRatio;
                    // Only set if height is reasonable (not too tall)
                    if (calculatedHeight <= 400 && calculatedHeight >= 100) {
                      onVideoDimensions(containerWidth, calculatedHeight);
                    }
                  }
                } catch (error) {
                  // Silently handle errors in dimension calculation
                  console.warn('Error calculating video dimensions:', error);
                }
              }, 100);
            }
            
            // Call onThumbnail with the video src as a simple identifier
            onThumbnail?.(normalizedSrc);
          } catch (error) {
            // Handle any errors gracefully
            console.warn('Error in onLoadedMetadata:', error);
            setIsLoading(false);
            setHasError(true);
          }
        }}
        onError={(e) => {
          try {
            const video = e.currentTarget;
            // If error and haven't tried without CORS, try that
            if (!tryWithoutCors && video.crossOrigin === 'anonymous') {
              setTryWithoutCors(true);
              if (videoRef.current) {
                videoRef.current.removeAttribute('crossorigin');
                videoRef.current.load();
              }
            } else {
              // Already tried without CORS or other error
              setIsLoading(false);
              setHasError(true);
            }
          } catch (error) {
            // Handle errors gracefully - just show error state
            console.warn('Error handling video error event:', error);
            setIsLoading(false);
            setHasError(true);
          }
        }}
        onCanPlay={() => {
          // Video can play, hide loading
          setIsLoading(false);
        }}
      />
    </div>
  );
};