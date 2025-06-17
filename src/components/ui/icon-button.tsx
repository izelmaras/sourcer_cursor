import { cn } from "../../lib/utils";
import { Button } from "./button";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  color?: "light" | "dark";
  size?: "sm" | "lg";
}

export const IconButton = ({ children, className, color = "light", size = "sm", ...props }: IconButtonProps) => {
  // Square size: w-10 h-10 for sm, w-12 h-12 for lg
  const dimension = size === "lg" ? "w-12 h-12" : "w-10 h-10";
  return (
    <Button
      size={size}
      color={color}
      className={cn(
        dimension,
        "rounded-[12px] flex items-center justify-center p-0",
        color === "light" ? "bg-white hover:bg-gray-50 text-gray-900" : "bg-gray-800 hover:bg-gray-700 text-white",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};