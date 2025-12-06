import { LinkIcon, LightbulbIcon, LayersIcon, FilmIcon } from "lucide-react";
import React, { useState, memo, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ContentBadge } from "../../../../components/ui/content-badge";
import { GalleryTile, GalleryTileContent } from "../../../../components/ui/card";
import { useAtomStore } from "../../../../store/atoms";
import { Database } from "../../../../types/supabase";
import { LazyImage } from "../../../../components/ui/lazy-image";
import { HtmlContent } from "../../../../components/ui/html-content";
import { VideoPlayer } from "../../../../components/ui/video-player";
import { getYouTubeVideoId, isVideoUrl, getProxiedImageUrl } from "../../../../lib/utils";
import { LiveLinkPreview } from "../../../../components/ui/LiveLinkPreview";
import Masonry from 'react-masonry-css';
import { VideoThumbnail } from "../../../../components/ui/video-thumbnail";
import { Button } from "../../../../components/ui/button";
import { InlineDetail } from "../../../../components/ui/inline-detail";
import { backgrounds, borders, text, radius } from "../../../../lib/design-tokens";

type Atom = Database['public']['Tables']['atoms']['Row'];

interface GallerySectionProps {
  searchTerm: string;
  selectedContentTypes: string[];
  selectedCreator: string | null;
  selectedIdea: number | null;
  onIdeaFilterChange: (ideaId: number | null) => void;
}

const Gallery = memo(({ atoms, onSelect, searchTerm, selectedContentTypes, selectedCreator, selectedIdea, onIdeaFilterChange }: { 
  atoms: Atom[], 
  onSelect: (atom: Atom) => void,
  searchTerm?: string,
  selectedContentTypes?: string[],
  selectedCreator?: string | null,
  selectedIdea?: number | null,
  onIdeaFilterChange?: (ideaId: number | null) => void
}) => {
  const navigate = useNavigate();
  const { deletingIds, updateAtom, fetchAtoms, fetchChildAtoms } = useAtomStore();
  const [visibleCount, setVisibleCount] = useState(12);
  const lastFilterRef = useRef<string>("");
  const [expandedAtomId, setExpandedAtomId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [childAtomCounts, setChildAtomCounts] = useState<Map<number, number>>(new Map());
  const [videoHeights, setVideoHeights] = useState<Map<number, number>>(new Map());
  const [currentIdeaChildAtoms, setCurrentIdeaChildAtoms] = useState<Atom[]>([]);
  const [isLoadingChildAtoms, setIsLoadingChildAtoms] = useState(false);
  const [currentParentIdeaId, setCurrentParentIdeaId] = useState<number | null>(null);

  // Constants for rate limiting
  const MIN_LOAD_INTERVAL = 1000; // Minimum 1 second between loads
  const BATCH_SIZE = 12; // Number of items to load per batch
  const MAX_ITEMS = 10000; // Increased limit to show all items

  // Helper to create a filter signature
  const getFilterSignature = () => {
    return JSON.stringify({
      searchTerm,
      selectedContentTypes,
      selectedCreator,
      selectedIdea
    });
  };

  // Rate-limited load more function
  const loadMore = useCallback(() => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Check if we can load more
    if (isLoadingMore || !hasMore || visibleCount >= atoms.length) {
      return;
    }

    // Rate limiting: ensure minimum interval between loads
    if (timeSinceLastLoad < MIN_LOAD_INTERVAL) {
      const remainingTime = MIN_LOAD_INTERVAL - timeSinceLastLoad;
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
      loadMoreTimeoutRef.current = setTimeout(() => {
        loadMore();
      }, remainingTime);
      return;
    }

    setIsLoadingMore(true);
    lastLoadTimeRef.current = now;

    // Simulate loading delay for better UX
    setTimeout(() => {
      const newCount = Math.min(visibleCount + BATCH_SIZE, atoms.length);
      setVisibleCount(newCount);
      setHasMore(newCount < atoms.length);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, visibleCount, atoms.length]);

  // Intersection observer for automatic loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        rootMargin: '200px', // Start loading when 200px away from the bottom
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  // Only reset visibleCount when filters/search change
  useEffect(() => {
    const filterSignature = getFilterSignature();
    if (lastFilterRef.current !== filterSignature) {
      setVisibleCount(12);
      setHasMore(true);
      lastFilterRef.current = filterSignature;
      setExpandedAtomId(null); // Close expanded view when filters change
      lastLoadTimeRef.current = 0; // Reset rate limiting
    }
  }, [searchTerm, selectedContentTypes, selectedCreator, selectedIdea]);

  // Fetch child atom counts for idea atoms
  useEffect(() => {
    const fetchCounts = async () => {
      const ideaAtoms = atoms.filter(atom => atom.content_type === 'idea');
      const counts = new Map<number, number>();
      
      await Promise.all(
        ideaAtoms.map(async (atom) => {
          try {
            const children = await fetchChildAtoms(atom.id);
            counts.set(atom.id, children.length);
          } catch (error) {
            console.error(`Error fetching child atoms for idea ${atom.id}:`, error);
            counts.set(atom.id, 0);
          }
        })
      );
      
      setChildAtomCounts(counts);
    };

    if (atoms.length > 0) {
      fetchCounts();
    }
  }, [atoms, fetchChildAtoms]);

  const handleAtomClick = async (atom: Atom) => {
    if (expandedAtomId === atom.id) {
      setExpandedAtomId(null); // Close if already expanded
    } else {
      setExpandedAtomId(atom.id); // Expand this atom
      // Scroll to top smoothly when opening
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // If it's an idea, fetch its child atoms for navigation
      if (atom.content_type === 'idea') {
        setCurrentParentIdeaId(atom.id);
        setIsLoadingChildAtoms(true);
        try {
          const children = await fetchChildAtoms(atom.id);
          setCurrentIdeaChildAtoms(children);
        } catch (error) {
          console.error('Error fetching child atoms:', error);
          setCurrentIdeaChildAtoms([]);
        } finally {
          setIsLoadingChildAtoms(false);
        }
      } else {
        // Check if this atom is a child of an idea we're viewing
        // If so, keep the parent idea context
        const isChildOfCurrentIdea = currentIdeaChildAtoms.some(child => child.id === atom.id);
        if (!isChildOfCurrentIdea) {
          setCurrentParentIdeaId(null);
          setCurrentIdeaChildAtoms([]);
        }
      }
    }
    onSelect(atom);
  };

  const handleCloseExpanded = () => {
    setExpandedAtomId(null);
    setCurrentIdeaChildAtoms([]);
    setCurrentParentIdeaId(null);
  };

  const handleNavigateExpanded = async (direction: 'prev' | 'next') => {
    if (!expandedAtomId) return;
    
    const expandedAtom = atoms.find(atom => atom.id === expandedAtomId);
    
    // If we have a parent idea context, navigate through its children
    if (currentParentIdeaId && currentIdeaChildAtoms.length > 0) {
      const isViewingIdea = expandedAtom?.content_type === 'idea' && expandedAtom.id === currentParentIdeaId;
      const currentChildIndex = currentIdeaChildAtoms.findIndex(atom => atom.id === expandedAtomId);
      
      if (isViewingIdea) {
        // Navigating from the idea itself - go to first/last child
        if (direction === 'next') {
          const firstChild = currentIdeaChildAtoms[0];
          if (firstChild) {
            setExpandedAtomId(firstChild.id);
          }
        } else {
          const lastChild = currentIdeaChildAtoms[currentIdeaChildAtoms.length - 1];
          if (lastChild) {
            setExpandedAtomId(lastChild.id);
          }
        }
      } else if (currentChildIndex !== -1) {
        // Navigating through child atoms
        const newIndex = direction === 'prev' 
          ? (currentChildIndex - 1 + currentIdeaChildAtoms.length) % currentIdeaChildAtoms.length
          : (currentChildIndex + 1) % currentIdeaChildAtoms.length;
        
        const newAtom = currentIdeaChildAtoms[newIndex];
        setExpandedAtomId(newAtom.id);
      }
    } else {
      // Normal navigation through all atoms - wrap around continuously
      const currentIndex = atoms.findIndex(atom => atom.id === expandedAtomId);
      if (currentIndex === -1) return;
      
      // Use modulo to wrap around continuously
      const newIndex = direction === 'prev' 
        ? (currentIndex - 1 + atoms.length) % atoms.length
        : (currentIndex + 1) % atoms.length;
      
      const newAtom = atoms[newIndex];
      setExpandedAtomId(newAtom.id);
      
      // If the new atom is an idea, fetch its child atoms
      if (newAtom.content_type === 'idea') {
        setCurrentParentIdeaId(newAtom.id);
        setIsLoadingChildAtoms(true);
        try {
          const children = await fetchChildAtoms(newAtom.id);
          setCurrentIdeaChildAtoms(children);
        } catch (error) {
          console.error('Error fetching child atoms:', error);
          setCurrentIdeaChildAtoms([]);
        } finally {
          setIsLoadingChildAtoms(false);
        }
      } else {
        setCurrentParentIdeaId(null);
        setCurrentIdeaChildAtoms([]);
      }
    }
  };

  const handleUpdateAtom = async (updatedAtom: Atom) => {
    try {
      // Update the atom in the database
      await updateAtom(updatedAtom.id, updatedAtom);
      // Refresh the atoms list to get the latest data
      await fetchAtoms();
    } catch (error) {
      console.error('Error updating atom:', error);
    }
  };

  const handleDeleteAtom = (atomId: number) => {
    setExpandedAtomId(null);
    // The store will handle the deletion
  };

  // Use the utility function from lib/utils

  const capitalizeTag = (tag: string) => {
    return tag
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const expandedAtom = expandedAtomId ? atoms.find(atom => atom.id === expandedAtomId) : null;
  const expandedIndex = expandedAtom ? atoms.findIndex(atom => atom.id === expandedAtomId) : -1;
  
  // Determine if we're in an idea context (viewing an idea or its children)
  const isInIdeaContext = currentParentIdeaId !== null && currentIdeaChildAtoms.length > 0;
  const isViewingIdea = expandedAtom?.content_type === 'idea' && expandedAtom.id === currentParentIdeaId;
  const currentChildIndex = isInIdeaContext ? currentIdeaChildAtoms.findIndex(atom => atom.id === expandedAtomId) : -1;
  
  // If in idea context, navigation is through its children
  // Otherwise, normal navigation through all atoms
  const hasPrevious = isInIdeaContext
    ? isViewingIdea || currentChildIndex > 0 // Can navigate to children or previous child
    : expandedIndex > 0;
  
  const hasNext = isInIdeaContext
    ? isViewingIdea || currentChildIndex < currentIdeaChildAtoms.length - 1 // Can navigate to children or next child
    : expandedIndex < Math.min(visibleCount, atoms.length) - 1;

  return (
    <div className="w-full space-y-6">
      {/* Expanded Content Banner */}
      {expandedAtom && (
        <div className="w-full">
          <InlineDetail
            atom={expandedAtom}
            onClose={handleCloseExpanded}
            onNavigate={handleNavigateExpanded}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onUpdate={handleUpdateAtom}
            onDelete={handleDeleteAtom}
            onOpenAtom={async (atom) => {
              // Maintain idea context if clicking a child atom from the current idea
              if (currentParentIdeaId && currentIdeaChildAtoms.some(child => child.id === atom.id)) {
                setExpandedAtomId(atom.id);
                // Scroll to top smoothly when opening
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onSelect(atom);
              } else {
                // Open atom normally, which will reset idea context if needed
                await handleAtomClick(atom);
              }
            }}
          />
        </div>
      )}

      {/* Gallery Grid */}
      <Masonry
        breakpointCols={{
          default: 4,
          1280: 4,
          1024: 3,
          768: 2,
          0: 1
        }}
        className="flex w-full gap-3"
        columnClassName="masonry-column"
      >
        {atoms.slice(0, visibleCount).map((atom) => {
          const isImageType = atom.content_type === 'image';
          const isVideoType = atom.content_type === 'video' || atom.content_type === 'youtube';
          const hasMedia = (isImageType || isVideoType) && (atom.media_source_link || atom.link);
          const mediaUrl = atom.media_source_link || atom.link || '';
          const isVideo = hasMedia && isVideoUrl(mediaUrl);
          const isDeleting = deletingIds.includes(atom.id);
          const isExpanded = expandedAtomId === atom.id;
          
          if (isImageType) {
            return (
              <GalleryTile
                key={atom.id}
                className={`relative break-inside-avoid p-0 overflow-hidden cursor-pointer group bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 hover:shadow-2xl select-none focus:outline-none transition-all duration-300 hover:scale-[1.02] ${
                  isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
                } ${isExpanded ? 'ring-2 ring-white/40' : ''}`}
                onClick={() => handleAtomClick(atom)}
              >
                                  {hasMedia && (
                    <div className="relative w-full overflow-hidden">
                      <LazyImage
                        src={mediaUrl}
                        alt={atom.title}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </GalleryTile>
            );
          }

          // Show video thumbnail for video/youtube in feed
          if (isVideoType) {
            let thumbnailUrl = '';
            let isDirectVideo = false;
            let videoUrl = '';
            
            if (atom.content_type === 'youtube' && atom.link) {
              const videoId = getYouTubeVideoId(atom.link);
              if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                videoUrl = atom.link;
              }
            } else if (atom.media_source_link) {
              isDirectVideo = true;
              thumbnailUrl = atom.media_source_link;
              videoUrl = atom.media_source_link;
            }
            
            return (
              <GalleryTile
                key={atom.id}
                className={`relative break-inside-avoid p-0 overflow-hidden cursor-pointer group bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 hover:shadow-2xl select-none focus:outline-none transition-all duration-300 hover:scale-[1.02] ${
                  isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
                } ${isExpanded ? 'ring-2 ring-white/40' : ''}`}
                onClick={() => handleAtomClick(atom)}
              >
                <div 
                  className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden"
                  style={{
                    minHeight: videoHeights.get(atom.id) ? `${videoHeights.get(atom.id)}px` : '200px',
                    maxHeight: '400px',
                    height: videoHeights.get(atom.id) ? `${videoHeights.get(atom.id)}px` : 'auto'
                  }}
                >
                  {isDirectVideo ? (
                    <VideoThumbnail 
                      src={thumbnailUrl} 
                      alt={atom.title} 
                      className="max-h-[400px] max-w-full transition-transform duration-300 group-hover:scale-105" 
                      onVideoDimensions={(width, height) => {
                        // Only set height for horizontal videos (width > height)
                        if (width > height && height <= 400) {
                          setVideoHeights(prev => new Map(prev).set(atom.id, height));
                        }
                      }}
                    />
                  ) : thumbnailUrl ? (
                    <LazyImage
                      src={thumbnailUrl}
                      alt={atom.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <div className="text-sm">No video</div>
                    </div>
                  )}
                </div>
              </GalleryTile>
            );
          }

          const isIdea = atom.content_type === 'idea';
          const isMovie = atom.content_type === 'movie';
          const isNote = atom.content_type === 'note';
          const childCount = childAtomCounts.get(atom.id) || 0;

          return (
            <GalleryTile
              key={atom.id}
              className={`relative break-inside-avoid p-0 overflow-hidden cursor-pointer group ${isIdea ? 'bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-transparent border-orange-300/20' : 'bg-white/5 backdrop-blur-sm border border-white/10'} shadow-2xl hover:shadow-2xl select-none focus:outline-none transition-all duration-300 hover:scale-[1.02] ${
                isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
              } ${isExpanded ? 'ring-2 ring-white/40' : ''}`}
              onClick={() => handleAtomClick(atom)}
            >
              <GalleryTileContent className={`relative px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5 flex flex-col min-h-[120px] text-white`}>
                {atom.content_type === 'link' && atom.link && (
                  <div className="mb-2 flex justify-center">
                    <LiveLinkPreview url={atom.link || ""} height={240}>
                      {typeof (atom as any).ogImage === 'string' && (atom as any).ogImage ? (
                        <img src={getProxiedImageUrl((atom as any).ogImage)} alt={atom.title} className="w-full h-40 object-cover rounded" />
                      ) : atom.link ? (
                        <img
                          src={`https://api.microlink.io/?url=${encodeURIComponent(atom.link || "")}&screenshot=true&embed=screenshot.url`}
                          alt={atom.title}
                          className="w-full h-40 object-cover rounded"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : null}
                    </LiveLinkPreview>
                  </div>
                )}
                {isIdea && (
                  <div className={`mb-2 flex items-center gap-1.5 px-2 py-1 w-fit ${backgrounds.layer1} ${borders.secondary} ${radius.md} backdrop-blur-sm`}>
                    <span className="text-xs font-medium text-white whitespace-nowrap">
                      Idea
                    </span>
                    {childCount > 0 && (
                      <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-white/20 flex-shrink-0">
                        <LayersIcon className="h-3 w-3 text-white" />
                        <span className="text-xs text-white whitespace-nowrap">{childCount}</span>
                      </div>
                    )}
                  </div>
                )}
                {isMovie && (
                  <div className={`mb-2 flex items-center gap-1.5 px-2 py-1 w-fit ${backgrounds.layer1} ${borders.secondary} ${radius.md} backdrop-blur-sm`}>
                    <FilmIcon className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white whitespace-nowrap">
                      Movie
                    </span>
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  {isNote ? (
                    // For notes, show only description
                    atom.description && (
                      <div>
                        <HtmlContent 
                          html={atom.description} 
                          className="text-sm sm:text-base break-words text-white/90"
                        />
                      </div>
                    )
                  ) : (
                    // For other types, show title if it exists, then description
                    // If no title, still show description if it exists
                    ((atom.title && atom.title !== ' ') || atom.description) && (
                      <div className="space-y-1">
                  {atom.title && atom.title !== ' ' && (
                      <h4 className="text-sm sm:text-base font-medium break-words line-clamp-2 text-white">
                        {atom.title}
                      </h4>
                        )}
                      {atom.description && (
                        <div>
                          <HtmlContent 
                            html={atom.description} 
                            className="text-xs sm:text-sm break-words text-white/80"
                          />
                        </div>
                      )}
                    </div>
                    )
                  )}
                  {atom.tags && atom.tags.filter(tag => tag.toLowerCase() !== 'link').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {atom.tags.filter(tag => tag.toLowerCase() !== 'link').map((tag, index, arr) => (
                        <span key={index} className="text-xs text-white/70">
                          {capitalizeTag(tag)}
                          {index < arr.length - 1 && ","}
                        </span>
                      ))}
                    </div>
                  )}
                  {atom.creator_name && (
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <span className="text-sm text-white/70">
                        By
                      </span>
                      <span className="text-sm font-medium break-words text-white">
                        {atom.creator_name}
                      </span>
                    </div>
                  )}
                </div>
              </GalleryTileContent>
            </GalleryTile>
          );
        })}
      </Masonry>

      {/* Lazy Load Trigger */}
      <div ref={loadMoreRef} className="flex justify-center w-full py-8">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            <span>Loading more...</span>
          </div>
        ) : hasMore && visibleCount < atoms.length ? (
          <Button
            size="lg"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            Load More ({visibleCount} of {atoms.length})
          </Button>
        ) : visibleCount >= atoms.length ? (
          <div className="text-gray-500 text-sm">
            Showing all {visibleCount} items
          </div>
        ) : null}
      </div>
    </div>
  );
});

Gallery.displayName = 'Gallery';

export const GallerySection = ({ searchTerm, selectedContentTypes, selectedCreator, selectedIdea, onIdeaFilterChange }: GallerySectionProps): JSX.Element => {
  const { atoms, selectedTags, categories, getCategoryTags, defaultCategoryId, fetchChildAtoms } = useAtomStore();
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);
  const [ideaChildAtomIds, setIdeaChildAtomIds] = useState<Set<number>>(new Set());
  const [isLoadingIdeaChildren, setIsLoadingIdeaChildren] = useState(false);

  // Fetch child atoms when idea filter is selected
  useEffect(() => {
    const fetchChildren = async () => {
      if (selectedIdea) {
        setIsLoadingIdeaChildren(true);
        try {
          const children = await fetchChildAtoms(selectedIdea);
          setIdeaChildAtomIds(new Set(children.map(c => c.id)));
        } catch (error) {
          console.error('Error fetching child atoms for idea filter:', error);
          setIdeaChildAtomIds(new Set());
        } finally {
          setIsLoadingIdeaChildren(false);
        }
      } else {
        setIdeaChildAtomIds(new Set());
      }
    };
    fetchChildren();
  }, [selectedIdea, fetchChildAtoms]);

  const filteredAtoms = useMemo(() => {
    let result = atoms.filter(atom => {
      const matchesSearch = searchTerm.toLowerCase() === '' || 
        atom.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atom.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (atom.tags && atom.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = selectedContentTypes.length === 0 || selectedContentTypes.includes(atom.content_type);
      const matchesCreator =
        !selectedCreator ||
        (atom.creator_name &&
          atom.creator_name
            .split(',')
            .map(name => name.trim())
            .includes(selectedCreator));
      const atomTags = atom.tags || [];
      const isInPrivateCategory = categories.some(category => 
        category.is_private && 
        getCategoryTags(category.id).some(tag => atomTags.includes(tag.name))
      );
      const selectedTagsInPrivateCategories = selectedTags.some(tagName =>
        categories.some(category =>
          category.is_private &&
          getCategoryTags(category.id).some(tag => tag.name === tagName)
        )
      );
      const defaultCategoryTags = defaultCategoryId ? getCategoryTags(defaultCategoryId).map(t => t.name) : [];
      const matchesDefaultCategory = !defaultCategoryId || 
        selectedTags.length > 0 || 
        atomTags.some(tag => defaultCategoryTags.includes(tag));
      const matchesFlagged = selectedTags.includes('flagged') ? atom.flag_for_deletion : true;
      // Tagless filter logic
      const matchesNoTag = selectedTags.includes('no-tag') ? (!atom.tags || atom.tags.length === 0) : true;

      return matchesSearch && 
             matchesType && 
             matchesCreator &&
             !isInPrivateCategory &&
             !selectedTagsInPrivateCategories &&
             matchesDefaultCategory &&
             matchesFlagged &&
             matchesNoTag &&
             (selectedTags.length === 0 || selectedTags.every(tag => tag === 'flagged' || tag === 'no-tag' || atomTags.includes(tag)));
    });

    // Filter by idea: if selectedIdea is set, only show atoms that are children of that idea
    if (selectedIdea && !isLoadingIdeaChildren) {
      result = result.filter(atom => ideaChildAtomIds.has(atom.id));
    }

    return result;
  }, [atoms, searchTerm, selectedContentTypes, selectedCreator, selectedTags, categories, defaultCategoryId, selectedIdea, ideaChildAtomIds, isLoadingIdeaChildren, getCategoryTags]);

  return (
    <Gallery 
      atoms={filteredAtoms} 
      onSelect={setSelectedAtom}
      searchTerm={searchTerm}
      selectedContentTypes={selectedContentTypes}
      selectedCreator={selectedCreator}
      selectedIdea={selectedIdea}
      onIdeaFilterChange={onIdeaFilterChange}
    />
  );
};