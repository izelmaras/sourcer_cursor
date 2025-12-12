import { ChevronDownIcon, ChevronRightIcon, Flag, ImageOff, FolderIcon, PlusIcon, FilterIcon, NewspaperIcon, BookAudioIcon as AudioIcon, BookIcon, HeartIcon, LightbulbIcon, ImageIcon, FileTextIcon, LinkIcon, FilmIcon, PlayCircleIcon, UtensilsIcon, MusicIcon, ListIcon, VideoIcon, X, UsersIcon, SearchIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { colors, backgrounds, borders, text, icons, radius, dropdowns, utilities, tags } from "../../../../lib/design-tokens";
import { SearchBar } from "../../../../components/ui/search-bar";
import { CreatorDropdown } from "../../../../components/ui/creator-dropdown";
import { useAtomStore } from "../../../../store/atoms";

interface AddAndNavigationByAnimaProps {
  onViewChange: (view: 'grid') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedContentTypes: string[];
  onContentTypeSelect: (type: string) => void;
  selectedCreators: string[];
  onCreatorsSelect: (creators: string[]) => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesChange: (show: boolean) => void;
  searchMode: 'search' | 'creators';
  onSearchModeChange: (mode: 'search' | 'creators') => void;
  selectedIdea?: number | null;
  onIdeaFilterChange?: (ideaId: number | null) => void;
}



export const AddAndNavigationByAnima = ({ 
  onViewChange, 
  searchTerm, 
  onSearchChange,
  selectedContentTypes,
  onContentTypeSelect,
  selectedCreators,
  onCreatorsSelect,
  showOnlyFavorites,
  onShowOnlyFavoritesChange,
  searchMode,
  onSearchModeChange,
  selectedIdea,
  onIdeaFilterChange
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
    setDefaultCategory,
    getChildAtomCount
  } = useAtomStore();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isOtherTagsExpanded, setIsOtherTagsExpanded] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [creatorSearchTerm, setCreatorSearchTerm] = useState('');

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdown = document.querySelector('[data-filter-dropdown]');
      const filterButton = document.querySelector('[data-filter-button]');
      
      if (isFilterDropdownOpen && 
          dropdown && 
          !dropdown.contains(target) && 
          filterButton && 
          !filterButton.contains(target)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const uncategorizedTags = tags.filter(tag => 
    !categories.some(cat => getCategoryTags(cat.id).some(t => t.id === tag.id))
  );

  const flaggedCount = atoms.filter(atom => atom.flag_for_deletion).length;
  const taglessCount = atoms.filter(atom => !atom.tags || atom.tags.length === 0).length;

  const handleFlaggedToggle = () => {
    toggleTag('flagged');
  };

  // Content types for filter dropdown
  const contentTypes = [
    { icon: <NewspaperIcon className="h-4 w-4" />, label: "Article/blog", type: "article" },
    { icon: <AudioIcon className="h-4 w-4" />, label: "Audio", type: "audio" },
    { icon: <BookIcon className="h-4 w-4" />, label: "Book", type: "book" },
    { icon: <HeartIcon className="h-4 w-4" />, label: "Feeling", type: "feeling" },
    { icon: <LightbulbIcon className="h-4 w-4" />, label: "Idea", type: "idea" },
    { icon: <ImageIcon className="h-4 w-4" />, label: "Image", type: "image" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Life event", type: "life-event" },
    { icon: <LinkIcon className="h-4 w-4" />, label: "Link", type: "link" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Memory", type: "memory" },
    { icon: <FilmIcon className="h-4 w-4" />, label: "Movie", type: "movie" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Note", type: "note" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "PDF", type: "pdf" },
    { icon: <PlayCircleIcon className="h-4 w-4" />, label: "Podcast", type: "podcast" },
    { icon: <FolderIcon className="h-4 w-4" />, label: "Project", type: "project" },
    { icon: <UtensilsIcon className="h-4 w-4" />, label: "Recipe", type: "recipe" },
    { icon: <MusicIcon className="h-4 w-4" />, label: "Spotify", type: "spotify" },
    { icon: <MusicIcon className="h-4 w-4" />, label: "Playlist", type: "playlist" },
    { icon: <ListIcon className="h-4 w-4" />, label: "Task", type: "task" },
    { icon: <VideoIcon className="h-4 w-4" />, label: "Video", type: "video" },
    { icon: <LinkIcon className="h-4 w-4" />, label: "Website", type: "website" },
    { icon: <PlayCircleIcon className="h-4 w-4" />, label: "YouTube", type: "youtube" },
  ];

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col w-full gap-3">
        <div className="flex flex-col sm:flex-row w-full gap-2">
          <div className="relative flex-1 min-w-0 flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              {/* Search Bar - works for both search and creator modes */}
              <SearchBar
                placeholder={searchMode === 'search' ? "Search" : "Search creators..."}
                value={searchMode === 'search' ? searchTerm : creatorSearchTerm}
                onChange={(e) => {
                  if (searchMode === 'search') {
                    onSearchChange(e.target.value);
                  } else {
                    setCreatorSearchTerm(e.target.value);
                  }
                }}
                color="light"
                className="w-full"
              />

              {/* Creator Dropdown - shown when in creator mode, positioned below search bar */}
              {searchMode === 'creators' && (
                <CreatorDropdown
                  selectedCreators={selectedCreators}
                  onCreatorsChange={onCreatorsSelect}
                  showOnlyFavorites={showOnlyFavorites}
                  onShowOnlyFavoritesChange={onShowOnlyFavoritesChange}
                  compact={true}
                  searchTerm={creatorSearchTerm}
                  onSearchChange={setCreatorSearchTerm}
                />
              )}
            </div>

            {/* Toggle Button - moved to right */}
            <button
              onClick={() => {
                const newMode = searchMode === 'search' ? 'creators' : 'search';
                onSearchModeChange(newMode);
                // Clear search when switching modes
                if (newMode === 'creators') {
                  setCreatorSearchTerm('');
                } else {
                  onSearchChange('');
                }
              }}
              className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-105 aspect-square ${
                searchMode === 'creators'
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-white/10 bg-white/8 hover:bg-white/10 text-white'
              }`}
              title={searchMode === 'search' ? 'Switch to creator search' : 'Switch to content search'}
            >
              {searchMode === 'search' ? (
                <UsersIcon className="h-5 w-5" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
            </button>

            <div className="relative">
              <button
                data-filter-button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-105 aspect-square ${
                  selectedContentTypes.length > 0
                    ? 'border-white/30 bg-white/15 text-white'
                    : 'border-white/10 bg-white/8 hover:bg-white/10 text-white'
                }`}
              >
                <FilterIcon className="h-5 w-5" />
                {selectedContentTypes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center backdrop-blur-sm">
                    {selectedContentTypes.length}
                  </span>
                )}
              </button>
              {isFilterDropdownOpen && (
                <div data-filter-dropdown className="absolute top-full right-0 mt-2 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl z-50 min-w-48 max-h-64 overflow-y-auto" style={{ backgroundColor: 'rgba(180, 185, 190, 0.95)' }}>
                  <div className="p-3">
                    {contentTypes.map(ct => (
                      <button
                        key={ct.type}
                        onClick={() => {
                          onContentTypeSelect(ct.type);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ${
                          selectedContentTypes.includes(ct.type)
                            ? 'bg-white/40 text-white shadow-lg border border-white/50'
                            : 'text-white hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <div className={`${selectedContentTypes.includes(ct.type) ? 'text-white' : 'text-white'}`}>
                          {ct.icon}
                        </div>
                        <span className="text-sm font-medium">{ct.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openOrganize'))}
              className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-white/10 bg-white/8 backdrop-blur-sm hover:bg-white/10 text-white transition-all duration-300 hover:scale-105 aspect-square"
            >
              <FolderIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAdd'))}
              className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-white/10 bg-white/8 backdrop-blur-sm hover:bg-white/10 text-white transition-all duration-300 hover:scale-105 aspect-square"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>



        {/* Category Carousel */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-3xl px-2 md:px-4">
          {categories
            .filter(category => !category.is_private) // Only show public categories
            .map((category) => {
              const categoryTags = getCategoryTags(category.id);
              const itemCount = atoms.filter(atom => 
                atom.tags && atom.tags.some(tag => 
                  categoryTags.some(ct => ct.name === tag)
                )
              ).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setDefaultCategory(defaultCategoryId === category.id ? null : category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 border backdrop-blur-sm ${
                    defaultCategoryId === category.id
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/8 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm whitespace-nowrap text-white">
                      {category.name}
                    </span>
                    {itemCount > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                        defaultCategoryId === category.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/8 text-white/80'
                      }`}>
                        {itemCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Ideas Carousel - Separate Row */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-3xl px-2 md:px-4">
          {atoms
            .filter(atom => atom.content_type === 'idea')
            .sort((a, b) => {
              // Sort by most recent first (by created_at)
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })
            .map((idea) => {
              // Count child atoms for this idea using the store function
              const childCount = getChildAtomCount(idea.id);
              
              return (
                <button
                  key={idea.id}
                  onClick={() => {
                    if (onIdeaFilterChange) {
                      onIdeaFilterChange(selectedIdea === idea.id ? null : idea.id);
                    }
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 border backdrop-blur-sm ${
                    selectedIdea === idea.id
                      ? 'bg-orange-400/20 border-orange-300/30 text-white'
                      : 'bg-white/8 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LightbulbIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm whitespace-nowrap text-white truncate max-w-[200px]">
                      {idea.title || `Idea #${idea.id}`}
                    </span>
                    {childCount > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                        selectedIdea === idea.id
                          ? 'bg-orange-400/20 text-white'
                          : 'bg-white/8 text-white/80'
                      }`}>
                        {childCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Tags Row - appears when a category is selected */}
        {defaultCategoryId && (
          <div className="flex flex-wrap gap-2 rounded-3xl px-2 md:px-4">
            {(() => {
              const selectedCategory = categories.find(c => c.id === defaultCategoryId);
              if (!selectedCategory) return null;
              
              const categoryTags = getCategoryTags(selectedCategory.id);
              
              // Sort tags by usage count (most used first)
              const sortedTags = categoryTags.sort((a, b) => {
                const aCount = atoms.filter(atom => 
                  atom.tags && atom.tags.includes(a.name)
                ).length;
                const bCount = atoms.filter(atom => 
                  atom.tags && atom.tags.includes(b.name)
                ).length;
                return bCount - aCount;
              });
              
              return sortedTags.map((tag) => {
                const tagCount = atoms.filter(atom => 
                  atom.tags && atom.tags.includes(tag.name)
                ).length;
                
                const isSelected = selectedTags.includes(tag.name);
                const withCountBase = tags?.variants?.withCount?.base?.className || 'px-3 py-1.5 text-sm rounded-2xl transition-all duration-200 flex items-center gap-2';
                const withCountSelected = tags?.variants?.withCount?.selected?.className || 'bg-white/20 text-white border border-white/30';
                const withCountUnselected = tags?.variants?.withCount?.unselected?.className || 'bg-white/8 text-white border border-white/10 hover:bg-white/10 hover:text-white';
                const badgeSelected = tags?.variants?.withCount?.badge?.selected?.className || 'px-1.5 py-0.5 text-xs rounded-full bg-white/20 text-white';
                const badgeUnselected = tags?.variants?.withCount?.badge?.unselected?.className || 'px-1.5 py-0.5 text-xs rounded-full bg-white/8 text-white/80';
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`${withCountBase} ${
                      isSelected
                        ? withCountSelected
                        : withCountUnselected
                    }`}
                  >
                    <span className="text-white">{tag.name}</span>
                    <span className={`ml-2 ${isSelected ? badgeSelected : badgeUnselected}`}>
                      {tagCount}
                    </span>
                  </button>
                );
              });
            })()}
          </div>
        )}
      </div>

      {isFiltersExpanded && (
        <div className="bg-white/8 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
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
                    <div className="mt-2 flex flex-wrap gap-[2px]">
                      {getCategoryTags(category.id)
                        .map(tag => ({
                          ...tag,
                          tagCount: atoms.filter(atom => atom.tags && atom.tags.includes(tag.name)).length
                        }))
                        .sort((a, b) => b.tagCount - a.tagCount)
                        .map(tag => (
                          <Button
                            key={tag.id}
                            size="sm"
                            className="text-xs px-2 py-1 h-7"
                            selected={selectedTags.includes(tag.name)}
                            onClick={() => toggleTag(tag.name)}
                          >
                            <span className="truncate">
                              {tag.name}
                              <span className="ml-1 text-xs opacity-60">
                                ({tag.tagCount})
                              </span>
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
                      <div className="flex flex-wrap gap-[2px]">
                        {uncategorizedTags
                          .map(tag => ({
                            ...tag,
                            tagCount: atoms.filter(atom => atom.tags && atom.tags.includes(tag.name)).length
                          }))
                          .sort((a, b) => b.tagCount - a.tagCount)
                          .map(tag => (
                            <Button
                              key={tag.id}
                              size="sm"
                              className="text-xs px-2 py-1 h-7"
                              selected={selectedTags.includes(tag.name)}
                              onClick={() => toggleTag(tag.name)}
                            >
                              <span className="truncate">
                                {tag.name}
                                <span className="ml-1 text-xs opacity-60">
                                  ({tag.tagCount})
                                </span>
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