import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon, StarIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAtomStore } from '../../store/atoms';

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
              <div className="absolute left-3 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-white/80" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0",
                  "bg-white/5 backdrop-blur-sm border-white/10",
                  "text-white placeholder-white/60",
                  "focus:bg-white/8 focus:border-white/20 focus:ring-white/20",
                  "hover:bg-white/6 hover:border-white/15"
                )}
              />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-3 p-1 hover:bg-white/10 rounded transition-colors"
              >
                <ChevronDownIcon className={cn(
                  "h-4 w-4 text-white/80 transition-transform",
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
        <div className="absolute z-50 w-full mt-2 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-h-64 overflow-y-auto" style={{ backgroundColor: 'rgba(149, 153, 160, 0.95)' }}>
          <div className="p-2">
            {/* Show Only Favorites Toggle */}
            <button
              onClick={() => {
                onShowOnlyFavoritesChange(!showOnlyFavorites);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 rounded-2xl text-left transition-all duration-300 mb-2",
                showOnlyFavorites
                  ? 'bg-white/40 text-white shadow-lg border border-white/50'
                  : 'text-white hover:bg-white/20 hover:text-white'
              )}
            >
              <StarIcon className={cn(
                "h-4 w-4",
                showOnlyFavorites ? "fill-yellow-400 text-yellow-400" : "text-white/60"
              )} />
              <span className="text-sm font-medium">Show only favorites</span>
            </button>

            {/* Creators List */}
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between px-4 py-2 rounded-2xl hover:bg-white/20 transition-colors group"
                >
                  <button
                    onClick={() => handleCreatorToggle(creator.name)}
                    className="flex-1 text-left text-white text-sm hover:text-white"
                  >
                    {creator.name}
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(creator.name, e)}
                    className={cn(
                      "p-1 rounded transition-colors",
                      isFavorite(creator.name)
                        ? "text-yellow-400 hover:bg-white/20"
                        : "text-white/40 hover:text-yellow-400 hover:bg-white/10"
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
              <div className="px-4 py-2 text-white/60 text-sm text-center">
                No creators found
              </div>
            ) : (
              <div className="px-4 py-2 text-white/60 text-sm text-center">
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

