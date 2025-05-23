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
          "focus:outline-none focus:ring-2 focus:ring-neutral-600",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-black hover:bg-neutral-200": variant === "default",
            "bg-neutral-800 text-white hover:bg-neutral-700": variant === "ghost",
            "bg-neutral-800 text-white hover:bg-neutral-700": variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
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