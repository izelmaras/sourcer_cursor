import React, { useState, useEffect, useRef } from 'react';

interface LiveLinkPreviewProps {
  url: string;
  children: React.ReactNode;
  height?: number | string;
}

export const LiveLinkPreview: React.FC<LiveLinkPreviewProps> = ({ url, children, height = 200 }) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setFailed(false);
    setLoading(true);
    setHasTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
    }, 4000); // 4 seconds grace period
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
  const handleError = () => {
    setFailed(true);
    setLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if ((failed || hasTimedOut) && !loading) {
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, border: '1.5px solid #cbd5e1', borderRadius: 8 }} className="overflow-hidden">
      {loading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', zIndex: 1
        }}>
          <span>Loading preview…</span>
        </div>
      )}
      <iframe
        src={url}
        title="Live Link Preview"
        style={{ width: '100%', height: '100%', border: 0, display: loading ? 'none' : 'block', borderRadius: 8 }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}; 