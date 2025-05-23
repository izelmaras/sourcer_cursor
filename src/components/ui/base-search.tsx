import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { SearchIcon } from 'lucide-react';

export interface BaseSearchProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  iconClassName?: string;
}

export const BaseSearch = React.forwardRef<HTMLInputElement, BaseSearchProps>(
  ({ className, containerClassName, iconClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <SearchIcon className={cn(
          "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500",
          iconClassName
        )} />
        <input
          type="search"
          className={cn(
            "h-12 w-full rounded-lg bg-white pl-11 pr-4",
            "text-gray-900 placeholder:text-gray-500",
            "border border-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-gray-900",
            "transition-colors duration-200",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

BaseSearch.displayName = 'BaseSearch';