import { Button } from "./button";
import { X as XIcon, Tag as TagIcon } from "lucide-react";
import { useAtomStore } from "../../store/atoms";

interface TagListProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export const TagList = ({ tags, onTagClick }: TagListProps): JSX.Element => {
  const { selectedTags } = useAtomStore();

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.filter(Boolean).map((tag) => (
        <Button
          key={tag}
          size="sm"
          selected={selectedTags.includes(tag)}
          leftIcon={<TagIcon className="h-4 w-4" />}
          {...(onTagClick ? { rightIcon: <XIcon className="h-4 w-4" /> } : {})}
          onClick={() => onTagClick?.(tag)}
          aria-pressed={selectedTags.includes(tag)}
        >
          {tag}
        </Button>
      ))}
    </div>
  );
};