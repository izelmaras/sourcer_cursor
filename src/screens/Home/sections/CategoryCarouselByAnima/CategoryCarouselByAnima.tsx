import React, { useEffect, useState } from "react";
import { useAtomStore } from "../../../../store/atoms";
import { Button } from "../../../../components/ui/button";
import { ScrollArea, ScrollBar } from "../../../../components/ui/scroll-area";
import { colors } from "../../../../lib/design-tokens";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

export const CategoryCarouselByAnima = (): JSX.Element => {
  const { 
    categories,
    tags, 
    selectedTags,
    fetchCategories,
    fetchTags,
    fetchCategoryTags,
    getCategoryTags,
    toggleTag,
    defaultCategoryId,
    setDefaultCategory,
    isTagDrawerCollapsed,
    setTagDrawerCollapsed,
    fetchDefaultCategory
  } = useAtomStore();

  const [isOtherTagsExpanded, setIsOtherTagsExpanded] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchTags(),
        fetchCategoryTags(),
        fetchDefaultCategory()
      ]);

      // Set Interface category as default if no default is set
      if (!defaultCategoryId) {
        const interfaceCategory = categories.find(c => c.name.toLowerCase() === 'interface');
        if (interfaceCategory) {
          await setDefaultCategory(interfaceCategory.id);
        }
      }
    };
    
    initializeData();
  }, [fetchCategories, fetchTags, fetchCategoryTags, fetchDefaultCategory, categories, defaultCategoryId, setDefaultCategory]);

  const uncategorizedTags = tags.filter(tag => 
    !categories.some(cat => getCategoryTags(cat.id).some(t => t.id === tag.id))
  );

  const totalTags = tags.length;

  const handleCategoryClick = async (categoryId: number) => {
    await setDefaultCategory(categoryId === defaultCategoryId ? null : categoryId);
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm max-h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTagDrawerCollapsed(!isTagDrawerCollapsed)}
            className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700"
          >
            {isTagDrawerCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
            Curate
          </button>
          <span className="text-xs text-gray-500">
            ({totalTags})
          </span>
        </div>
        {selectedTags.length > 0 && (
          <div className="text-xs text-gray-500">
            {selectedTags.length} selected
          </div>
        )}
      </div>

      {!isTagDrawerCollapsed && (
        <ScrollArea className="flex-1 w-full overflow-y-auto">
          <div className="flex gap-6 p-6">
            {categories.map(category => (
              <div key={category.id} className="flex flex-col gap-2 min-w-[160px] md:min-w-[200px]">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center justify-between text-left ${
                    defaultCategoryId === category.id 
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900'
                  } px-2 py-1 rounded-md transition-colors`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({getCategoryTags(category.id).length})
                    </span>
                  </div>
                </button>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="flex flex-col gap-1">
                    {getCategoryTags(category.id).map(tag => (
                      <Button
                        key={tag.id}
                        variant={selectedTags.includes(tag.name) ? "default" : "ghost"}
                        size="sm"
                        className={`justify-start h-8 px-3 text-left ${
                          selectedTags.includes(tag.name)
                            ? colors.tag.selected
                            : colors.tag.unselected
                        }`}
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
                </ScrollArea>
              </div>
            ))}

            {uncategorizedTags.length > 0 && (
              <div className="flex flex-col gap-2 min-w-[160px] md:min-w-[200px]">
                <button
                  onClick={() => setIsOtherTagsExpanded(!isOtherTagsExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  {isOtherTagsExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                  Other Tags
                  <span className="text-xs text-gray-500">
                    ({uncategorizedTags.length})
                  </span>
                </button>
                
                {isOtherTagsExpanded && (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="flex flex-col gap-1">
                      {uncategorizedTags.map(tag => (
                        <Button
                          key={tag.id}
                          variant={selectedTags.includes(tag.name) ? "default" : "ghost"}
                          size="sm"
                          className={`justify-start h-8 px-3 text-left ${
                            selectedTags.includes(tag.name)
                              ? colors.tag.selected
                              : colors.tag.unselected
                          }`}
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
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
          <ScrollBar 
            orientation="horizontal" 
            className="h-2.5 bg-gray-100 rounded-full" 
          />
        </ScrollArea>
      )}
    </div>
  );
};