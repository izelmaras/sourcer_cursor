import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg bg-neutral-800 px-4 py-2 text-white transition-colors",
            "placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-neutral-600",
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