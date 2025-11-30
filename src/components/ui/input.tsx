import * as React from "react";
import { cn } from "../../lib/utils";
import { inputs } from "../../lib/design-tokens";

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
    const variant = color === "dark" ? inputs.variants.dark : 
                   color === "glass" ? inputs.variants.glass : 
                   inputs.variants.light;
    
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          type={type}
          className={cn(
            inputs.base.className,
            inputs.size[inputSize],
            variant,
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