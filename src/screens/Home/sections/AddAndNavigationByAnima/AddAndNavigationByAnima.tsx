import { ChevronDownIcon, ChevronRightIcon, Flag, ImageOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { colors } from "../../../../lib/design-tokens";
import { SearchBar } from "../../../../components/ui/search-bar";
import { useAtomStore } from "../../../../store/atoms";

interface AddAndNavigationByAnimaProps {
  onViewChange: (view: 'grid') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedContentTypes: string[];
  onContentTypeSelect: (type: string) => void;
  selectedCreator: string | null;
  onCreatorSelect: (creator: string | null) => void;
}

const contentTypes = [
  { type: "article", label: "Article/blog" },
  { type: "audio", label: "Audio" },
  { type: "book", label: "Book" },
  { type: "feeling", label: "Feeling" },
  { type: "idea", label: "Idea" },
  { type: "image", label: "Image" },
  { type: "life-event", label: "Life event" },
  { type: "link", label: "Link" },
  { type: "memory", label: "Memory" },
  { type: "movie", label: "Movie" },
  { type: "note", label: "Note" },
  { type: "pdf", label: "PDF" },
  { type: "podcast", label: "Podcast" },
  { type: "project", label: "Project" },
  { type: "recipe", label: "Recipe" },
  { type: "spotify", label: "Spotify" },
  { type: "spotify-playlist", label: "Playlist" },
  { type: "task", label: "Task" },
  { type: "video", label: "Video" },
  { type: "website", label: "Website" },
  { type: "youtube", label: "YouTube" },
];

export const AddAndNavigationByAnima = ({ 
  onViewChange, 
  searchTerm, 
  onSearchChange,
  selectedContentTypes,
  onContentTypeSelect,
  selectedCreator,
  onCreatorSelect
}: AddAndNavigationByAnimaProps): JSX.Element => {
  const { 
    categories,
    tags, 
    atoms,
    selectedTags,
    fetchCategories,
    fetchTags,
    fetchCategoryTags,
    getCategoryTags,
    toggleTag,
    defaultCategoryId,
    setDefaultCategory
  } = useAtomStore();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isOtherTagsExpanded, setIsOtherTagsExpanded] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchTags(),
        fetchCategoryTags()
      ]);
    };
    
    initializeData();
  }, [fetchCategories, fetchTags, fetchCategoryTags]);

  const uncategorizedTags = tags.filter(tag => 
    !categories.some(cat => getCategoryTags(cat.id).some(t => t.id === tag.id))
  );

  const flaggedCount = atoms.filter(atom => atom.flag_for_deletion).length;
  const taglessCount = atoms.filter(atom => !atom.tags || atom.tags.length === 0).length;

  const handleFlaggedToggle = () => {
    toggleTag('flagged');
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col sm:flex-row w-full gap-2">
        <div className="relative flex-1 min-w-0 flex items-center gap-2">
          <SearchBar
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            color="light"
            className="w-full"
          />
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 transition-colors"
          >
            {isFiltersExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isFiltersExpanded && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 space-y-6">
            {/* Content Types */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                selected={selectedContentTypes.length === 0}
                onClick={() => onContentTypeSelect('All')}
              >
                All
              </Button>
              {contentTypes.map((type) => (
                <Button
                  key={type.type}
                  size="sm"
                  selected={selectedContentTypes.includes(type.type)}
                  onClick={() => onContentTypeSelect(type.type)}
                >
                  {type.label}
                </Button>
              ))}
            </div>

            {/* Categories */}
            <div className="border-t pt-6">
              <div className="flex gap-6 overflow-x-auto pb-4">
                {categories.map(category => (
                  <div key={category.id} className="min-w-[200px]">
                    <button
                      onClick={() => setDefaultCategory(category.id === defaultCategoryId ? null : category.id)}
                      className={`flex items-center text-left w-full ${
                        defaultCategoryId === category.id 
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900'
                      } px-2 py-1 rounded-md transition-colors`}
                    >
                      <span className="text-sm font-medium">
                        {category.name} <span className="text-gray-500 ml-1">({getCategoryTags(category.id).length})</span>
                      </span>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getCategoryTags(category.id).map(tag => (
                        <Button
                          key={tag.id}
                          size="sm"
                          selected={selectedTags.includes(tag.name)}
                          onClick={() => toggleTag(tag.name)}
                        >
                          <span className="truncate">
                            {tag.name}
                            {tag.count && (
                              <span className="ml-1 text-xs opacity-60">
                                ({tag.count})
                              </span>
                            )}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Tags */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                {/* Uncategorized Tags */}
                {uncategorizedTags.length > 0 && (
                  <div>
                    <button
                      onClick={() => setIsOtherTagsExpanded(!isOtherTagsExpanded)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 px-2 py-1 mb-2"
                    >
                      <span>
                        Other Tags <span className="text-gray-500 ml-1">({uncategorizedTags.length})</span>
                      </span>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        {isOtherTagsExpanded ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    
                    {isOtherTagsExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {uncategorizedTags.map(tag => (
                          <Button
                            key={tag.id}
                            size="sm"
                            selected={selectedTags.includes(tag.name)}
                            onClick={() => toggleTag(tag.name)}
                          >
                            <span className="truncate">
                              {tag.name}
                              {tag.count && (
                                <span className="ml-1 text-xs opacity-60">
                                  ({tag.count})
                                </span>
                              )}
                            </span>
                          </Button>
                        ))}

                        {/* Flagged Items Button */}
                        <Button
                          size="sm"
                          selected={selectedTags.includes('flagged')}
                          onClick={handleFlaggedToggle}
                          leftIcon={<Flag className="w-4 h-4" />}
                        >
                          Flagged
                          <span className="ml-2 text-xs opacity-60">({flaggedCount})</span>
                        </Button>
                        {/* Tagless Items Button */}
                        <Button
                          size="sm"
                          selected={selectedTags.includes('no-tag')}
                          onClick={() => toggleTag('no-tag')}
                          leftIcon={<ImageOff className="w-4 h-4" />}
                        >
                          No Tag
                          <span className="ml-2 text-xs opacity-60">({taglessCount})</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};