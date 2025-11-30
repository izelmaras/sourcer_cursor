import * as React from "react";

import { cn } from "../../lib/utils";
import { cards, backgrounds, borders, text, radius, utilities } from "../../lib/design-tokens";

const GalleryTile = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cards.base.className,
      cards.hover,
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-white/3 before:rounded-xl",
      "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/3 after:to-transparent after:rounded-xl",
      "group cursor-pointer",
      className,
    )}
    {...props}
  />
));
GalleryTile.displayName = "GalleryTile";

const GalleryTileHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(`flex flex-col space-y-1.5 p-6 ${backgrounds.layer3}`, className)}
    {...props}
  />
));
GalleryTileHeader.displayName = "GalleryTileHeader";

const GalleryTileTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(`font-semibold leading-none tracking-tight ${text.primary}`, className)}
    {...props}
  />
));
GalleryTileTitle.displayName = "GalleryTileTitle";

const GalleryTileDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(`text-sm ${text.secondary}`, className)}
    {...props}
  />
));
GalleryTileDescription.displayName = "GalleryTileDescription";

const GalleryTileContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(`p-6 pt-0 ${backgrounds.layer3}`, className)} {...props} />
));
GalleryTileContent.displayName = "GalleryTileContent";

export {
  GalleryTile,
  GalleryTileHeader,
  GalleryTileTitle,
  GalleryTileDescription,
  GalleryTileContent,
};
