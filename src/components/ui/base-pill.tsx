import React from 'react';
import { cn } from '../../lib/utils';

interface BasePillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  isSelected?: boolean;
}

export const BasePill = React.forwardRef<HTMLDivElement, BasePillProps>(
  ({ className, variant = 'default', size = 'default', isSelected, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full transition-colors";
    
    const variants = {
      default: "bg-white text-gray-900",
      outline: "border border-gray-200 bg-white text-gray-900",
      ghost: "bg-transparent text-gray-900",
    };

    const sizes = {
      default: "h-8 px-4 py-2",
      sm: "h-6 px-3 text-sm",
      lg: "h-10 px-6",
    };

    const selectedStyles = isSelected ? "bg-gray-900 text-white" : "";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], selectedStyles, className)}
        {...props}
      />
    );
  }
);

BasePill.displayName = 'BasePill';