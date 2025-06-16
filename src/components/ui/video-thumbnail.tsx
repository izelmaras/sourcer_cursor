import React, { useEffect, useRef, useState } from 'react';

interface VideoThumbnailProps {
  src: string;
  seek?: number; // seconds
  alt?: string;
  className?: string;
  onThumbnail?: (dataUrl: string) => void;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  seek = 1,
  alt = 'Video thumbnail',
  className = '',
  onThumbnail,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [triedServer, setTriedServer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setThumbnail(null);
    setError(false);
    setTriedServer(false);
    const video = videoRef.current;
    if (!video) return;
    video.crossOrigin = 'anonymous';
    video.src = src;
    video.load();
    const handleLoadedMetadata = () => {
      if (video.duration < seek) {
        setError(true);
        return;
      }
      video.currentTime = seek;
    };
    const handleSeeked = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setThumbnail(dataUrl);
        onThumbnail?.(dataUrl);
      } catch (e) {
        setError(true);
      }
    };
    const handleError = () => setError(true);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [src, seek, onThumbnail]);

  // If client-side fails, try server-side
  useEffect(() => {
    if (error && !triedServer) {
      setTriedServer(true);
      const fetchServerThumb = async () => {
        try {
          const apiUrl = `http://localhost:4000/thumbnail?url=${encodeURIComponent(src)}&t=${seek}`;
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error('Server thumbnail failed');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setThumbnail(url);
        } catch {
          setError(true);
        }
      };
      fetchServerThumb();
    }
  }, [error, triedServer, src, seek]);

  if (error && triedServer) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gray-200 text-gray-400 ${className}`}>
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
      </div>
    );
  }
  if (!thumbnail) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gray-200 animate-pulse ${className}`}>
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
        <video ref={videoRef} style={{ display: 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }
  return <img src={thumbnail} alt={alt} className={className} />;
}; 