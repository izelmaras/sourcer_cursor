import { cn } from "../../lib/utils";
import { UserIcon } from "lucide-react";

interface CreatorInfoProps {
  name: string;
  className?: string;
}

export function CreatorInfo({ name, className }: CreatorInfoProps) {
  if (!name) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserIcon className="w-4 h-4 text-white/80" />
      <span className="text-sm text-white/80">By</span>
      <span className="text-sm text-white font-medium">{name}</span>
    </div>
  );
}