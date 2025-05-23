import React from 'react';
import { getYouTubeEmbedUrl } from '../../lib/utils';

interface VideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}) => {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
  const isYouTube = Boolean(youtubeEmbedUrl);

  if (isYouTube && youtubeEmbedUrl) {
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      mute: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      rel: '0',
      modestbranding: '1',
    });

    return (
      <iframe
        src={`${youtubeEmbedUrl}?${params.toString()}`}
        className={`aspect-video w-full ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={src}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
    />
  );
};