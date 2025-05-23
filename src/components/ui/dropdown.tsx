import React from 'react';
import { cn } from '../../lib/utils';

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export const Dropdown = ({ children, className }: DropdownProps) => {
  return (
    <div className={cn(
      "bg-white border-none rounded-lg shadow-lg",
      className
    )}>
      {children}
    </div>
  );
};