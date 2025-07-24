import React from 'react';

interface ContentBadgeProps {
  type: string;
  className?: string;
}

export const ContentBadge = ({ type, className = '' }: ContentBadgeProps): JSX.Element => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
        {type}
      </span>
    </div>
  );
};