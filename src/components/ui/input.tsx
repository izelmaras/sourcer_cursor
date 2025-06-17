import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  color?: "light" | "dark";
  inputSize?: "sm" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, containerClassName, color = "light", inputSize = "sm", ...props },
    ref
  ) => {
    // Style logic
    const isDark = color === "dark";
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          type={type}
          className={cn(
            "block w-full appearance-none transition-colors duration-200 border focus:outline-none focus:ring-2",
            inputSize === "sm" ? "h-10 px-4 text-sm" : "h-12 px-5 text-base",
            "rounded-[12px]",
            isDark
              ? "bg-neutral-800 text-white border-neutral-700 placeholder:text-neutral-400 focus:ring-neutral-600 focus:border-neutral-600"
              : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-500 focus:ring-gray-900 focus:border-gray-900",
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