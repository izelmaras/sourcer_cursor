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

// Normalize protocol-relative URLs (add https: if missing)
export function normalizeUrl(url: string): string {
  if (!url) return url;
  
  // If it starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // If it doesn't have a protocol, add https://
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  
  return url;
}

// Enhanced video URL detection
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  // Normalize protocol-relative URLs first
  const normalizedUrl = normalizeUrl(url);
  
  // Check for YouTube URLs
  if (getYouTubeVideoId(normalizedUrl)) return true;
  
  // Check for video file extensions
  const videoExtensions = [
    'mp4', 'mov', 'webm', 'ogg', 'avi', 'mkv', 'm4v', 
    '3gp', 'flv', 'wmv', 'asf', 'f4v', 'f4p', 'f4a', 'f4b'
  ];
  
  const urlLower = normalizedUrl.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(`.${ext}`));
}

// Check if a URL is an image
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for image file extensions
  const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    'tiff', 'tif', 'heic', 'heif', 'avif'
  ];
  
  const urlLower = url.toLowerCase();
  // Check if URL ends with image extension or contains it before query params
  const hasImageExtension = imageExtensions.some(ext => {
    const pattern = new RegExp(`\\.${ext}(?:[?#]|$)`, 'i');
    return pattern.test(urlLower);
  });
  
  if (hasImageExtension) return true;
  
  // Check for common image hosting domains
  const imageDomains = [
    'imgur.com', 'i.imgur.com', 'unsplash.com', 'pexels.com',
    'pixabay.com', 'flickr.com', 'cloudinary.com', 'imgix.net'
  ];
  
  try {
    const urlObj = new URL(url);
    return imageDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Check if a video URL is likely to have CORS issues
export function isLikelyCorsRestricted(url: string): boolean {
  if (!url) return false;
  
  try {
    // Normalize URL first to handle protocol-relative URLs
    const normalizedUrl = normalizeUrl(url);
    const urlObj = new URL(normalizedUrl);
    const problematicDomains = [
      's3.amazonaws.com',
      's3.eu-west-2.amazonaws.com',
      'cloudfront.net',
      'cdn.',
      'static.',
      'media.',
      'assets.',
      'layers-uploads-prod.s3.eu-west-2.amazonaws.com',
      'www.mercuryos.com'
      // Note: Contentful CDN (ctfassets.net) removed - videos actually work fine
    ];
    
    return problematicDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
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