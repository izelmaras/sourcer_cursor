import * as React from "react";
import { cn } from "../../lib/utils";
import { buttons, text, utilities } from "../../lib/design-tokens";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "md", selected = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttons.base.className,
          buttons.size[size],
          selected ? buttons.states.selected : buttons.states.default,
          disabled && buttons.states.disabled,
          className
        )}
        ref={ref}
        disabled={disabled}
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