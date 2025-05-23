import { cn } from "../../../lib/utils";
import { colors } from "../../../lib/design-tokens";

interface ImageContainerProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function ImageContainer({ 
  onClick, 
  className, 
  children 
}: ImageContainerProps) {
  return (
    <div 
      className={cn(
        "w-full flex items-center justify-center",
        colors.background.secondary,
        "cursor-zoom-in",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}