import React from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  html: string;
  className?: string;
}

export const HtmlContent = ({ html, className = '' }: HtmlContentProps): JSX.Element => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  );
};