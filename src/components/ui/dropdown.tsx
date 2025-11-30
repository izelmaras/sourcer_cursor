import React from 'react';
import { cn } from '../../lib/utils';
import { radius, utilities, backgrounds, borders, text } from '../../lib/design-tokens';

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
  color?: 'light' | 'dark';
}

export const Dropdown = ({ children, className, color = 'light' }: DropdownProps) => {
  const isDark = color === 'dark';
  return (
    <div
      className={cn(
        radius.input,
        utilities.shadow.lg,
        'outline-none',
        utilities.transition.colors,
        isDark
          ? 'bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-gray-700'
          : `${backgrounds.light.base} ${text.light.primary} ${borders.light.primary} ${borders.focus.secondary}`,
        className
      )}
      tabIndex={0}
      role="menu"
    >
      {children}
    </div>
  );
};