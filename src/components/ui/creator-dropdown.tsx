import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon, StarIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAtomStore } from '../../store/atoms';
import { backgrounds, borders, text, icons, radius, dropdowns, utilities } from '../../lib/design-tokens';
import { SearchBar } from './search-bar';

interface CreatorDropdownProps {
  selectedCreators: string[];
  onCreatorsChange: (creators: string[]) => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesChange: (show: boolean) => void;
  className?: string;
  compact?: boolean; // When true, hides the search input and shows only selected creators and dropdown
  searchTerm?: string; // External search term for compact mode
  onSearchChange?: (value: string) => void; // Handler for search changes in compact mode
}

export const CreatorDropdown: React.FC<CreatorDropdownProps> = ({
  selectedCreators,
  onCreatorsChange,
  showOnlyFavorites,
  onShowOnlyFavoritesChange,
  className,
  compact = false,
  searchTerm: externalSearchTerm,
  onSearchChange: onExternalSearchChange
}) => {
  const { creators, favoriteCreators, toggleFavoriteCreator, fetchFavoriteCreators } = useAtomStore();
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use external search term if provided (compact mode), otherwise use internal
  const searchTerm = compact && externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = compact && onExternalSearchChange ? onExternalSearchChange : setInternalSearchTerm;

  useEffect(() => {
    fetchFavoriteCreators();
  }, [fetchFavoriteCreators]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const filteredCreators = creators
    .filter(creator => 
      creator.name.toLowerCase().includes((searchTerm || '').toLowerCase()) &&
      !selectedCreators.includes(creator.name)
    )
    .slice(0, 12);
  
  // Auto-open dropdown when search term changes in compact mode
  useEffect(() => {
    if (compact && searchTerm && searchTerm.length > 0) {
      setIsOpen(true);
    } else if (compact && (!searchTerm || searchTerm.length === 0)) {
      // Keep dropdown open if there are selected creators or if user hasn't closed it
      // Only auto-close if search is cleared and no creators selected
      if (selectedCreators.length === 0) {
        setIsOpen(false);
      }
    }
  }, [searchTerm, compact, selectedCreators.length]);

  const handleCreatorToggle = (creatorName: string) => {
    if (selectedCreators.includes(creatorName)) {
      onCreatorsChange(selectedCreators.filter(c => c !== creatorName));
    } else {
      onCreatorsChange([...selectedCreators, creatorName]);
    }
    setSearchTerm('');
    setIsOpen(false); // Close dropdown when creator is selected
  };

  const handleRemoveCreator = (creatorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreatorsChange(selectedCreators.filter(c => c !== creatorName));
  };

  const handleToggleFavorite = async (creatorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavoriteCreator(creatorName);
  };

  const isFavorite = (creatorName: string) => favoriteCreators.includes(creatorName);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        {/* Selected Creators Display - Removed, shown only in main filter tray */}

        {/* Search Input and Dropdown */}
        {!compact && (
          <div className="relative">
            <div className="relative flex items-center">
              <SearchBar
                ref={inputRef}
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="pr-10"
              />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute right-3 p-1 ${backgrounds.hover.layer3} ${radius.md} ${utilities.transition.colors}`}
              >
                <ChevronDownIcon className={cn(
                  `h-4 w-4 ${icons.secondary} transition-transform`,
                  isOpen && "transform rotate-180"
                )} />
              </button>
            </div>
          </div>
        )}

        {/* In compact mode, we don't show a button - the search bar handles the input */}
      </div>

      {/* Dropdown Menu - Shared for both modes, positioned relative to outer container */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 ${dropdowns.base.className} max-h-64 overflow-y-auto`} style={dropdowns.base.style}>
          <div className="p-2">
            {/* Show Only Favorites Toggle */}
            <button
              onClick={() => {
                onShowOnlyFavoritesChange(!showOnlyFavorites);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2",
                radius.xl,
                "text-left",
                utilities.transition.all,
                "mb-2",
                showOnlyFavorites
                  ? `${backgrounds.selected.layer2} ${text.primary} ${utilities.shadow.lg} ${borders.secondary}`
                  : `${text.primary} ${backgrounds.hover.layer2} ${text.hover}`
              )}
            >
              <StarIcon className={cn(
                "h-4 w-4",
                showOnlyFavorites ? "fill-yellow-400 text-yellow-400" : icons.muted
              )} />
              <span className="text-sm font-medium">Show only favorites</span>
            </button>

            {/* Creators List */}
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className={`flex items-center justify-between px-4 py-2 ${radius.xl} ${backgrounds.hover.layer2} ${utilities.transition.colors} group`}
                >
                  <button
                    onClick={() => handleCreatorToggle(creator.name)}
                    className={`flex-1 text-left ${text.primary} text-sm ${text.hover}`}
                  >
                    {creator.name}
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(creator.name, e)}
                    className={cn(
                      "p-1 rounded transition-colors",
                      isFavorite(creator.name)
                        ? "text-yellow-400 hover:bg-white/20"
                        : `${icons.disabled} hover:text-yellow-400 ${backgrounds.hover.layer3}`
                    )}
                    title={isFavorite(creator.name) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <StarIcon className={cn(
                      "h-4 w-4",
                      isFavorite(creator.name) && "fill-yellow-400"
                    )} />
                  </button>
                </div>
              ))
            ) : searchTerm ? (
              <div className={`px-4 py-2 ${text.muted} text-sm text-center`}>
                No creators found
              </div>
            ) : (
              <div className={`px-4 py-2 ${text.muted} text-sm text-center`}>
                {selectedCreators.length === creators.length 
                  ? "All creators selected" 
                  : "Start typing to search creators"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

