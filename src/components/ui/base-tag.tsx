import React from 'react';
import { cn } from '../../lib/utils';
import { X as XIcon } from 'lucide-react';

interface BaseTagProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  isSelected?: boolean;
}

export const BaseTag = React.forwardRef<HTMLDivElement, BaseTagProps>(
  ({ className, children, onRemove, isSelected, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center h-8 px-4 py-2 rounded-full text-sm transition-colors";
    const defaultStyles = isSelected
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, defaultStyles, className)}
        {...props}
      >
        {children}
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-2 hover:text-gray-600"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

BaseTag.displayName = 'BaseTag';