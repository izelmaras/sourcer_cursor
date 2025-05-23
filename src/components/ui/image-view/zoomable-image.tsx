import { cn } from "../../../lib/utils";

interface ZoomableImageProps {
  src: string;
  alt: string;
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
  transitionDuration: number;
  onLoad?: () => void;
  className?: string;
}

export function ZoomableImage({
  src,
  alt,
  scale,
  position,
  isDragging,
  transitionDuration,
  onLoad,
  className
}: ZoomableImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "max-w-[90vw] max-h-[90vh] object-contain will-change-transform",
        scale > 1 ? "cursor-move" : "cursor-zoom-out",
        className
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
        transition: isDragging ? 'none' : `transform ${transitionDuration}ms ease-out`,
        transformOrigin: 'center',
      }}
      onLoad={onLoad}
      draggable={false}
    />
  );
}