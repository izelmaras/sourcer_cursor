import React, { useState, useRef, useEffect } from 'react';
import { getYouTubeEmbedUrl, getYouTubeVideoId, isVideoUrl, isLikelyCorsRestricted, normalizeUrl } from '../../lib/utils';

interface VideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  debug?: boolean; // Add debug mode for troubleshooting
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  poster,
  debug = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldOpenInNewTab, setShouldOpenInNewTab] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Normalize the source URL (handle protocol-relative URLs)
  const normalizedSrc = normalizeUrl(src);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(normalizedSrc);
  const isYouTube = Boolean(youtubeEmbedUrl);
  const isVideoFile = isVideoUrl(normalizedSrc) && !isYouTube;
  const isProblematicDomain = isLikelyCorsRestricted(normalizedSrc);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    setShouldOpenInNewTab(false);
    setErrorMessage('');
    
    // Debug logging - REMOVED FOR PERFORMANCE
    // if (debug) {
    //   console.log('VideoPlayer Debug:', {
    //     src,
    //     isYouTube,
    //     isVideoFile,
    //     isProblematicDomain,
    //     youtubeEmbedUrl
    //   });
    // }
  }, [normalizedSrc, debug, isYouTube, isVideoFile, isProblematicDomain, youtubeEmbedUrl]);

  // Set up timeout for video loading - this must come before any early returns
  useEffect(() => {
    if (isVideoFile && !isYouTube) {
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          handleTimeout();
        }
      }, 4000); // Reduced to 4 seconds for better performance

      return () => clearTimeout(timeoutId);
    }
  }, [normalizedSrc, isLoading, isVideoFile, isYouTube]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    let message = 'Video playback error';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'Video playback was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = 'Video decoding error';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Video format not supported';
          break;
        default:
          message = 'Unknown video error';
      }
    }
    
    console.warn('Video player error for:', normalizedSrc, message);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(message);
  };

  const handleTimeout = () => {
    console.warn('Video loading timeout for:', normalizedSrc);
    setIsLoading(false);
    setShouldOpenInNewTab(true);
    setErrorMessage('Video loading timed out');
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Now we can have early returns after all hooks are called
  if (isYouTube && youtubeEmbedUrl) {
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      mute: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      rel: '0',
      modestbranding: '1',
      showinfo: '0',
    });

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <iframe
          src={`${youtubeEmbedUrl}?${params.toString()}`}
          className={`aspect-video w-full ${className}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage('YouTube video could not be loaded');
          }}
        />
      </div>
    );
  }

  if (!isVideoUrl(normalizedSrc)) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm">Unsupported video format</p>
          <p className="text-xs text-gray-400 mt-1">Supported: MP4, MOV, WebM, OGG, AVI, MKV, M4V, 3GP, FLV, WMV</p>
          {debug && (
            <div className="mt-2 p-2 bg-gray-200 rounded text-xs">
              <p>Debug: {normalizedSrc}</p>
            </div>
          )}
          <button 
            onClick={() => window.open(normalizedSrc, '_blank')}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
          >
            Try opening in new tab
          </button>
        </div>
      </div>
    );
  }

  // For problematic domains or timeout fallback, show a clickable interface instead of trying to embed
  // Only show fallback if we have an actual error or timeout, not just because domain is flagged
  // This allows videos that actually work (like Contentful CDN) to play
  if ((shouldOpenInNewTab || hasError) && isVideoFile) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer ${className}`} 
           onClick={() => window.open(normalizedSrc, '_blank')}>
        <div className="text-center p-4">
          <div className="mb-3">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Video cannot be played directly</p>
          <p className="text-xs text-gray-500 mb-3">
            {isProblematicDomain ? 'Due to access restrictions' : errorMessage || 'Click to open in new tab'}
          </p>
          {debug && (
            <div className="mb-2 p-2 bg-gray-200 rounded text-xs">
              <p>Debug: {normalizedSrc}</p>
              <p>Problematic: {isProblematicDomain ? 'Yes' : 'No'}</p>
              <p>Has Error: {hasError ? 'Yes' : 'No'}</p>
              <p>Should Open New Tab: {shouldOpenInNewTab ? 'Yes' : 'No'}</p>
            </div>
          )}
          <div className="inline-flex items-center gap-1 text-blue-600 text-xs">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            <span>Open Video</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <div className="text-center p-4">
          <div className="mb-3">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm mb-2">Video unavailable</p>
          <p className="text-xs text-gray-400 mb-3">{errorMessage || 'This video cannot be played due to access restrictions'}</p>
          {debug && (
            <div className="mb-2 p-2 bg-gray-200 rounded text-xs">
              <p>Debug: {normalizedSrc}</p>
              <p>Error: {errorMessage}</p>
            </div>
          )}
          <button 
            onClick={() => window.open(normalizedSrc, '_blank')}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Open in new tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading video...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={normalizedSrc}
        className={className}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        poster={poster}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
};