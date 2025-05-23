import { Button } from "./button";
import { colors } from "../../lib/design-tokens";
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
      {tags.map((tag) => (
        <Button
          key={tag}
          variant={selectedTags.includes(tag) ? "default" : "ghost"}
          size="sm"
          className={`${
            selectedTags.includes(tag) ? colors.tag.selected : colors.tag.unselected
          }`}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </Button>
      ))}
    </div>
  );
};