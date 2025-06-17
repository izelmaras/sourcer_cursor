import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "lg";
  selected?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  color?: "light" | "dark";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "sm",
      selected = false,
      leftIcon,
      rightIcon,
      color = "light",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDark = color === "dark";
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    const hasText = !!children && (typeof children !== 'string' || children.trim() !== '');
    // Icon-only: no text, only one icon
    const isIconOnly = (hasLeftIcon || hasRightIcon) && !hasText;
    // Fixed height for all buttons
    const fixedHeight = size === "lg" ? "h-12" : "h-10";
    const fixedTextSize = size === "lg" ? "text-base" : "text-sm";
    const fixedPadding = isIconOnly
      ? "px-0 w-10 justify-center"
      : hasLeftIcon && hasRightIcon
        ? (size === "sm" ? "px-3" : "px-5")
        : hasLeftIcon || hasRightIcon
          ? (size === "sm" ? "px-3" : "px-5")
          : (size === "sm" ? "px-4" : "px-6");
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:pointer-events-none disabled:opacity-50 border",
          fixedHeight,
          fixedTextSize,
          fixedPadding,
          isDark
            ? selected
              ? "bg-black text-white border-black hover:bg-gray-900"
              : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            : selected
              ? "bg-black text-white border-black hover:bg-gray-900"
              : "bg-gray-100 text-black border-gray-200 hover:bg-gray-200",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className={cn("flex items-center w-full gap-2 justify-center truncate")}> 
          {hasLeftIcon && <span className="flex items-center shrink-0 justify-center">{leftIcon}</span>}
          {hasText && <span className="truncate flex-1 text-center flex items-center justify-center">{children}</span>}
          {hasRightIcon && <span className="flex items-center shrink-0 justify-center">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };