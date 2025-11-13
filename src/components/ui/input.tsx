import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  color?: "light" | "dark" | "glass";
  inputSize?: "sm" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, containerClassName, color = "light", inputSize = "sm", ...props },
    ref
  ) => {
    // Style logic
    const isDark = color === "dark";
    const isGlass = color === "glass";
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          type={type}
          className={cn(
            "block w-full appearance-none transition-colors duration-200 border focus:outline-none focus:ring-2",
            inputSize === "sm" ? "h-10 px-4 text-sm" : "h-12 px-5 text-base",
            "rounded-[12px]",
            isDark
              ? "bg-neutral-800 text-white border-neutral-700 placeholder:text-neutral-400 placeholder:text-xs focus:ring-neutral-600 focus:border-neutral-600"
              : isGlass
              ? "bg-white/5 backdrop-blur-sm text-white border-white/10 placeholder:text-white/60 placeholder:text-xs focus:ring-white/20 focus:border-white/20 hover:bg-white/8"
              : "bg-white text-gray-900 border-gray-200 placeholder:text-white placeholder:text-xs focus:ring-gray-900 focus:border-gray-900",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };