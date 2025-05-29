import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-200",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-black border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md": variant === "default",
            "bg-white text-black border border-gray-200 hover:bg-gray-50": ["ghost", "secondary"].includes(variant),
            "bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-sm": variant === "destructive",
            "h-12 px-6 py-2": size === "default",
            "h-9 px-4": size === "sm",
            "h-14 px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };