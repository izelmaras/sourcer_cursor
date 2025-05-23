import React from 'react';
import { cn } from '../../lib/utils';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  isSelected?: boolean;
}

export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ className, variant = 'default', size = 'default', isSelected, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-white text-gray-900 hover:bg-gray-100",
      ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
      outline: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-100",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      destructive: "bg-red-500 text-white hover:bg-red-600",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
    };

    const selectedStyles = isSelected ? "bg-gray-900 text-white hover:bg-gray-800" : "";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], selectedStyles, className)}
        {...props}
      />
    );
  }
);

BaseButton.displayName = 'BaseButton';