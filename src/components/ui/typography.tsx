import { cn } from "../../lib/utils";
import { typography } from "../../lib/design-tokens";

interface TypographyProps {
  variant: keyof typeof typography.scale;
  color?: keyof typeof typography.colors;
  className?: string;
  children: React.ReactNode;
}

export function Typography({ 
  variant, 
  color = 'primary',
  className, 
  children 
}: TypographyProps) {
  const Component = variant.startsWith('h') ? variant : 'p';
  
  return (
    <Component 
      className={cn(
        typography.scale[variant],
        typography.colors[color],
        className
      )}
    >
      {children}
    </Component>
  );
}