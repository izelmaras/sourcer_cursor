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

// Check if a string is a valid URL format (synchronous check)
export function isValidUrl(url: string): boolean {
  try {
    if (!url || typeof url !== 'string') return false;
    
    // Reject file:// protocol URLs - they're not safe for web use
    if (url.toLowerCase().startsWith('file://')) {
      return false;
    }
    
    // Check if it's already a valid absolute URL
    try {
      const urlObj = new URL(url);
      // Only accept http and https protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      // Not a valid absolute URL
    }
    
    // Protocol-relative URLs (//example.com)
    if (url.startsWith('//')) {
      const withoutProtocol = url.slice(2);
      // Must have a domain (contains a dot and at least one slash or is just a domain)
      return withoutProtocol.includes('.') && (withoutProtocol.includes('/') || !withoutProtocol.includes(' '));
    }
    
    // If it's just a filename without path (e.g., "grok.mp4"), it's not a valid URL
    if (!url.includes('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
      // Check if it's just a filename pattern (word.extension)
      const filenamePattern = /^[^/\\]+\.\w+$/;
      if (filenamePattern.test(url)) {
        return false; // Just a filename, not a valid URL
      }
    }
    
    // If it has a slash, it might be a path or URL
    return true;
  } catch (error) {
    // If anything goes wrong, assume invalid to prevent crashes
    console.warn('Error validating URL:', url, error);
    return false;
  }
}

// Normalize protocol-relative URLs (add https: if missing)
export function normalizeUrl(url: string): string {
  try {
    if (!url || typeof url !== 'string') return url || '';
    
    // Reject file:// protocol URLs - they're not safe for web use
    if (url.toLowerCase().startsWith('file://')) {
      // Try to extract the path and convert to https if it looks like a web URL
      const pathMatch = url.match(/file:\/\/\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        const path = pathMatch[1];
        // If it looks like it has a domain, try to convert to https
        if (path.includes('.') && path.includes('/')) {
          return `https://${path}`;
        }
      }
      // Otherwise return empty string to indicate invalid URL
      return '';
    }
    
    // If it's already a valid absolute URL, return as-is
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return url;
      }
    } catch {
      // Not a valid absolute URL, continue with normalization
    }
    
    // If it starts with //, add https:
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    // If it doesn't have a protocol, add https://
    // But only if it looks like it could be a valid URL (not just a filename)
    if (!url.match(/^https?:\/\//i) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      // Don't normalize bare filenames - they'll be caught by error handling
      if (url.includes('/') || !/^[^/\\]+\.\w+$/.test(url)) {
        return `https://${url}`;
      }
    }
    
    return url;
  } catch (error) {
    // If anything goes wrong, return the original URL to prevent crashes
    console.warn('Error normalizing URL:', url, error);
    return url || '';
  }
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