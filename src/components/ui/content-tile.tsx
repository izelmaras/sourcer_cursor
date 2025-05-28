import React from 'react';
import { cn } from '../../lib/utils';

interface GalleryTileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GalleryTileButton = React.forwardRef<HTMLButtonElement, GalleryTileButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-col items-start w-full p-6 gap-2 bg-white rounded-xl border border-gray-100 shadow-sm",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (index === 0) {
            return <div className="text-gray-500">{child}</div>;
          }
          return <div className="text-gray-900 font-medium">{child}</div>;
        })}
      </button>
    );
  }
);

GalleryTileButton.displayName = 'GalleryTileButton';