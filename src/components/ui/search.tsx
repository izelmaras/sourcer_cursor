import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from './input';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Search = ({ className, ...props }: SearchProps) => {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        type="text"
        className="bg-neutral-900 text-white border-none pl-10 pr-4 w-full"
        {...props}
      />
    </div>
  );
};