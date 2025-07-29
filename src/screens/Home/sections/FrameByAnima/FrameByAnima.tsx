import { LinkIcon } from "lucide-react";
import React, { useState, memo, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ContentBadge } from "../../../../components/ui/content-badge";
import { GalleryTile, GalleryTileContent } from "../../../../components/ui/card";
import { useAtomStore } from "../../../../store/atoms";
import { Database } from "../../../../types/supabase";
import { LazyImage } from "../../../../components/ui/lazy-image";
import { HtmlContent } from "../../../../components/ui/html-content";
import { VideoPlayer } from "../../../../components/ui/video-player";
import { getYouTubeVideoId, isVideoUrl } from "../../../../lib/utils";
import { LiveLinkPreview } from "../../../../components/ui/LiveLinkPreview";
import Masonry from 'react-masonry-css';
import { VideoThumbnail } from "../../../../components/ui/video-thumbnail";
import { Button } from "../../../../components/ui/button";
import { InlineDetail } from "../../../../components/ui/inline-detail";

type Atom = Database['public']['Tables']['atoms']['Row'];

interface GallerySectionProps {
  searchTerm: string;
  selectedContentTypes: string[];
  selectedCreator: string | null;
}

const Gallery = memo(({ atoms, onSelect, searchTerm, selectedContentTypes, selectedCreator }: { 
  atoms: Atom[], 
  onSelect: (atom: Atom) => void,
  searchTerm?: string,
  selectedContentTypes?: string[],
  selectedCreator?: string | null
}) => {
  const navigate = useNavigate();
  const { deletingIds, updateAtom, fetchAtoms } = useAtomStore();
  const [visibleCount, setVisibleCount] = useState(12);
  const lastFilterRef = useRef<string>("");
  const [expandedAtomId, setExpandedAtomId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for rate limiting
  const MIN_LOAD_INTERVAL = 1000; // Minimum 1 second between loads
  const BATCH_SIZE = 12; // Number of items to load per batch
  const MAX_ITEMS = 10000; // Increased limit to show all items

  // Helper to create a filter signature
  const getFilterSignature = () => {
    return JSON.stringify({
      searchTerm,
      selectedContentTypes,
      selectedCreator
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
  }, [searchTerm, selectedContentTypes, selectedCreator]);

  const handleAtomClick = (atom: Atom) => {
    if (expandedAtomId === atom.id) {
      setExpandedAtomId(null); // Close if already expanded
    } else {
      setExpandedAtomId(atom.id); // Expand this atom
      // Scroll to top smoothly when opening
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onSelect(atom);
  };

  const handleCloseExpanded = () => {
    setExpandedAtomId(null);
  };

  const handleNavigateExpanded = (direction: 'prev' | 'next') => {
    const currentIndex = atoms.findIndex(atom => atom.id === expandedAtomId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + atoms.length) % atoms.length
      : (currentIndex + 1) % atoms.length;
    
    const newAtom = atoms[newIndex];
    setExpandedAtomId(newAtom.id);
  };

  const handleUpdateAtom = async (updatedAtom: Atom) => {
    console.log('handleUpdateAtom called with:', updatedAtom);
    try {
      // Update the atom in the database
      await updateAtom(updatedAtom.id, updatedAtom);
      console.log('Database update successful');
      // Refresh the atoms list to get the latest data
      await fetchAtoms();
      console.log('Atoms refreshed');
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

  return (
    <div className="w-full space-y-6">
      {/* Expanded Content Banner */}
      {expandedAtom && (
        <div className="w-full">
          <InlineDetail
            atom={expandedAtom}
            onClose={handleCloseExpanded}
            onNavigate={handleNavigateExpanded}
            hasPrevious={expandedIndex > 0}
            hasNext={expandedIndex < Math.min(visibleCount, atoms.length) - 1}
            onUpdate={handleUpdateAtom}
            onDelete={handleDeleteAtom}
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
                } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
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
                } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleAtomClick(atom)}
              >
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                  {isDirectVideo ? (
                    <VideoThumbnail 
                      src={thumbnailUrl} 
                      alt={atom.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
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

          return (
            <GalleryTile
              key={atom.id}
              className={`relative break-inside-avoid p-0 overflow-hidden cursor-pointer group bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 hover:shadow-2xl select-none focus:outline-none transition-all duration-300 hover:scale-[1.02] ${
                isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
              } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleAtomClick(atom)}
            >
              <GalleryTileContent className={`relative px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 flex flex-col min-h-[120px] text-white`}>
                {atom.content_type === 'link' && atom.link && (
                  <div className="mb-2 flex justify-center">
                    <LiveLinkPreview url={atom.link || ""} height={240}>
                      {typeof (atom as any).ogImage === 'string' && (atom as any).ogImage ? (
                        <img src={(atom as any).ogImage} alt={atom.title} className="w-full h-40 object-cover rounded" />
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
                <div className="flex-1 flex flex-col gap-2">
                  {atom.title && atom.title !== ' ' && (
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-medium break-words line-clamp-2 text-white">
                        {atom.title}
                      </h4>
                      {atom.description && (
                        <div className="line-clamp-2">
                          <HtmlContent 
                            html={atom.description} 
                            className="text-sm sm:text-base break-words text-white/80"
                          />
                        </div>
                      )}
                    </div>
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
                <a
                  href={atom.link || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 rounded-full p-2 shadow hover:bg-white/20 transition z-10 border bg-white/10 backdrop-blur-sm border-white/20"
                  onClick={e => e.stopPropagation()}
                >
                  <LinkIcon className="w-4 h-4 text-white" />
                </a>
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

export const GallerySection = ({ searchTerm, selectedContentTypes, selectedCreator }: GallerySectionProps): JSX.Element => {
  const { atoms, selectedTags, categories, getCategoryTags, defaultCategoryId } = useAtomStore();
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);

  const filteredAtoms = useMemo(() => {
    return atoms.filter(atom => {
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
  }, [atoms, searchTerm, selectedContentTypes, selectedCreator, selectedTags, categories, defaultCategoryId]);

  return (
    <Gallery 
      atoms={filteredAtoms} 
      onSelect={setSelectedAtom}
      searchTerm={searchTerm}
      selectedContentTypes={selectedContentTypes}
      selectedCreator={selectedCreator}
    />
  );
};