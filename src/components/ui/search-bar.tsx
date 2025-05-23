import React from 'react';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-900" />
        <input
          type="search"
          className={cn(
            "h-12 w-full pl-10 pr-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';