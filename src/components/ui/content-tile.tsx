import React from 'react';
import { cn } from '../../lib/utils';
import { backgrounds, borders, text, radius, utilities } from '../../lib/design-tokens';

interface GalleryTileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GalleryTileButton = React.forwardRef<HTMLButtonElement, GalleryTileButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-col items-start w-full p-6 gap-2",
          backgrounds.light.base,
          radius.card,
          borders.light.primary,
          utilities.shadow.sm,
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (index === 0) {
            return <div className={text.light.muted}>{child}</div>;
          }
          return <div className={`${text.light.primary} font-medium`}>{child}</div>;
        })}
      </button>
    );
  }
);

GalleryTileButton.displayName = 'GalleryTileButton';