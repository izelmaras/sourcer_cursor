import { cn } from "../../lib/utils";
import { Typography } from "./typography";

interface CreatorInfoProps {
  name: string;
  className?: string;
}

export function CreatorInfo({ name, className }: CreatorInfoProps) {
  if (!name) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Typography variant="body" color="muted">By</Typography>
      <Typography variant="body" color="primary">{name}</Typography>
    </div>
  );
}