import React, { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../../lib/utils';

interface LiveLinkPreviewProps {
  url: string;
  children: React.ReactNode;
  height?: number | string;
}

interface OgData {
  ogImage?: { url: string } | { url: string }[];
  ogTitle?: string;
  ogDescription?: string;
  [key: string]: any;
}

export const LiveLinkPreview: React.FC<LiveLinkPreviewProps> = ({ url, children, height = 200 }) => {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setOgData(null);
    
    // Skip API call in development to prevent proxy errors
    // The API will work in production on Vercel
    if (import.meta.env.DEV) {
      setLoading(false);
      setError(true);
      return;
    }
    
    // Use real API (production only)
    fetch('/api/og-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) setOgData(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height, border: '1.5px solid #cbd5e1', borderRadius: 8 }} className="overflow-hidden flex items-center justify-center bg-gray-50">
        <span>Loading preview…</span>
      </div>
    );
  }

  if (error || !ogData || (!ogData.ogImage && !ogData.ogTitle && !ogData.ogDescription)) {
    return <>{children}</>;
  }

  // Handle ogImage as array or object
  let imageUrl = '';
  if (Array.isArray(ogData.ogImage)) {
    imageUrl = ogData.ogImage[0]?.url;
  } else if (ogData.ogImage && typeof ogData.ogImage === 'object') {
    imageUrl = ogData.ogImage.url;
  }

  return (
    <div style={{ width: '100%', height, border: '1.5px solid #cbd5e1', borderRadius: 8 }} className="overflow-hidden bg-white flex flex-col">
      {imageUrl && (
        <img src={getProxiedImageUrl(imageUrl)} alt={ogData.ogTitle || 'Preview'} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
      )}
      <div className="p-2 flex-1 flex flex-col justify-center">
        {ogData.ogTitle && <div className="font-semibold text-sm mb-1 line-clamp-1">{ogData.ogTitle}</div>}
        {ogData.ogDescription && <div className="text-xs text-gray-500 line-clamp-2">{ogData.ogDescription}</div>}
      </div>
    </div>
  );
}; 