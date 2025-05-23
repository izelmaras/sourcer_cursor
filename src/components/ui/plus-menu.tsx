import React, { useState } from 'react';
import { Button } from './button';
import { PlusIcon } from 'lucide-react';

interface PlusMenuProps {
  title: string;
  items: string[];
  onSelect: (item: string) => void;
  className?: string;
}

export const PlusMenu = ({ title, items, onSelect, className = '' }: PlusMenuProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 bg-neutral-800 text-white hover:bg-neutral-700 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="ml-2">{title}</span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-48 rounded-lg bg-neutral-800 shadow-lg z-30">
            {items.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-neutral-700"
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
              >
                {item}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};