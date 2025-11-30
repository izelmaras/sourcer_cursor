import React from 'react';
import { SearchIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { searchBar, icons } from '../../lib/design-tokens';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: 'light' | 'dark';
  containerClassName?: string;
  showIcon?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(({
  placeholder = 'Search...',
  value,
  onChange,
  color = 'light',
  className,
  containerClassName,
  showIcon = true,
  ...props
}, ref) => {
  return (
    <div className={cn(
      "relative flex items-center",
      containerClassName
    )}>
      {showIcon && (
        <SearchIcon 
          className={cn(
            searchBar.icon.className,
            color === 'dark' && "text-gray-400"
          )}
          style={{ filter: 'none' }}
        />
      )}
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(searchBar.base.className, className)}
        {...props}
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';