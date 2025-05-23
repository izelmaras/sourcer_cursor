import { cn } from "../../lib/utils";
import { Button } from "./button";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const IconButton = ({ children, className, ...props }: IconButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "w-10 h-10 rounded-full bg-white hover:bg-gray-50 transition-colors",
        "flex items-center justify-center",
        "text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};