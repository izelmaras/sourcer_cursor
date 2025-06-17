import React from 'react';
import { cn } from '../../lib/utils';

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
        'rounded-[12px] shadow-lg outline-none transition-colors',
        isDark
          ? 'bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-gray-700'
          : 'bg-white text-gray-900 border border-gray-200 focus:ring-2 focus:ring-gray-900',
        className
      )}
      tabIndex={0}
      role="menu"
    >
      {children}
    </div>
  );
};