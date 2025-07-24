import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "md", selected = false, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base glassmorphism styling with reduced fills
          "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          "text-white hover:text-white",
          "hover:bg-white/8 hover:border-white/20 hover:scale-105",
          "focus:bg-white/8 focus:border-white/20 focus:ring-white/20",
          "active:scale-95",
          
          // Size variants
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          
          // Selected state with reduced fill
          selected && "bg-white/15 border-white/25 text-white shadow-lg",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          
          className
        )}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };