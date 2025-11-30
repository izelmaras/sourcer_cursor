import React from 'react';
import { backgrounds, text, radius } from '../../lib/design-tokens';

interface ContentBadgeProps {
  type: string;
  className?: string;
}

export const ContentBadge = ({ type, className = '' }: ContentBadgeProps): JSX.Element => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`px-3 py-1.5 ${backgrounds.light.subtle} ${text.light.primary} ${radius.full} text-sm font-medium`}>
        {type}
      </span>
    </div>
  );
};