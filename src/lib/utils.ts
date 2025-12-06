import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// Enhanced video URL detection
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for YouTube URLs
  if (getYouTubeVideoId(url)) return true;
  
  // Check for video file extensions
  const videoExtensions = [
    'mp4', 'mov', 'webm', 'ogg', 'avi', 'mkv', 'm4v', 
    '3gp', 'flv', 'wmv', 'asf', 'f4v', 'f4p', 'f4a', 'f4b'
  ];
  
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(`.${ext}`));
}

// Check if a video URL is likely to have CORS issues
export function isLikelyCorsRestricted(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const problematicDomains = [
      's3.amazonaws.com',
      's3.eu-west-2.amazonaws.com',
      'cloudfront.net',
      'cdn.',
      'static.',
      'media.',
      'assets.',
      'layers-uploads-prod.s3.eu-west-2.amazonaws.com',
      'www.mercuryos.com',
      'instagram.com',
      'cdninstagram.com'
    ];
    
    return problematicDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}

// Check if an image URL needs proxying due to CORS restrictions
export function isImageCorsRestricted(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const corsRestrictedDomains = [
      'instagram.com',
      'cdninstagram.com',
      'fbcdn.net'
    ];
    
    return corsRestrictedDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}

// Get proxied image URL for CORS-restricted images
export function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  
  if (isImageCorsRestricted(url)) {
    // Use the image proxy API
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}

// Get video format from URL
export function getVideoFormat(url: string): string | null {
  if (!url) return null;
  
  const match = url.toLowerCase().match(/\.([a-z0-9]+)(?:[?#]|$)/);
  return match ? match[1] : null;
}

// Validate if a video URL is accessible (basic check)
export async function validateVideoUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  if (!url) return { valid: false, error: 'No URL provided' };
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('video/') && !contentType.includes('application/octet-stream')) {
      return { valid: false, error: 'URL does not point to a video file' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}