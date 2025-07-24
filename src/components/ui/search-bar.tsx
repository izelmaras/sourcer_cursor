import React from 'react';
import { SearchIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: 'light' | 'dark';
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  color = 'light',
  className
}) => {
  return (
    <div className={cn(
      "relative flex items-center",
      className
    )}>
      <div className="absolute left-3 pointer-events-none">
        <SearchIcon className={cn(
          "h-5 w-5",
          color === 'light' ? "text-white/80" : "text-gray-400"
        )} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full pl-10 pr-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0",
          "bg-white/5 backdrop-blur-sm border-white/10",
          "text-white placeholder-white/60",
          "focus:bg-white/8 focus:border-white/20 focus:ring-white/20",
          "hover:bg-white/6 hover:border-white/15"
        )}
      />
    </div>
  );
};