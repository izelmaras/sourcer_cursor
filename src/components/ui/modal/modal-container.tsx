import { cn } from "../../../lib/utils";
import { colors } from "../../../lib/design-tokens";

interface ModalContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'full' | 'screen';
  className?: string;
}

export const ModalContainer = ({ children, variant = 'default', className }: ModalContainerProps) => {
  return (
    <div className={cn(
      "relative",
      colors.background.primary,
      "rounded-2xl shadow-xl",
      variant === 'full' && "w-[90vw] max-h-[90vh]",
      variant === 'screen' && "w-screen h-screen",
      variant === 'default' && "max-w-2xl w-full",
      className
    )}>
      {children}
    </div>
  );
};