import { cn } from "../../../lib/utils";
import { colors, spacing } from "../../../lib/design-tokens";

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between",
      spacing.container,
      "border-b",
      colors.border.primary,
      className
    )}>
      {children}
    </div>
  );
};