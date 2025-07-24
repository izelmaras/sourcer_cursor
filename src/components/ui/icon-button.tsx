import * as React from "react";
import { cn } from "../../lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base glassmorphism styling with reduced fills
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          "text-white hover:text-white",
          "hover:bg-white/8 hover:border-white/20 hover:scale-105",
          "focus:bg-white/8 focus:border-white/20 focus:ring-white/20",
          "active:scale-95",
          
          // Size variants
          size === "sm" && "w-8 h-8",
          size === "md" && "w-10 h-10",
          size === "lg" && "w-12 h-12",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };