import * as React from "react";

import { cn } from "../../lib/utils";

const GalleryTile = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[2px] border bg-white/30 backdrop-blur-md text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden relative",
      "border border-white/40",
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
    className={cn("flex flex-col space-y-1.5 p-6", className)}
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
    className={cn("font-semibold leading-none tracking-tight", className)}
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GalleryTileDescription.displayName = "GalleryTileDescription";

const GalleryTileContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GalleryTileContent.displayName = "GalleryTileContent";

const GalleryTileFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
GalleryTileFooter.displayName = "GalleryTileFooter";

export {
  GalleryTile,
  GalleryTileHeader,
  GalleryTileFooter,
  GalleryTileTitle,
  GalleryTileDescription,
  GalleryTileContent,
};
