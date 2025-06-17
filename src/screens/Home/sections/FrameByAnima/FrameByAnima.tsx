import { LinkIcon } from "lucide-react";
import React, { useState, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ContentBadge } from "../../../../components/ui/content-badge";
import { GalleryTile, GalleryTileContent } from "../../../../components/ui/card";
import { useAtomStore } from "../../../../store/atoms";
import { Database } from "../../../../types/supabase";
import { LazyImage } from "../../../../components/ui/lazy-image";
import { HtmlContent } from "../../../../components/ui/html-content";
import { VideoPlayer } from "../../../../components/ui/video-player";
import { getYouTubeVideoId } from "../../../../lib/utils";
import { LiveLinkPreview } from "../../../../components/ui/LiveLinkPreview";
import Masonry from 'react-masonry-css';
import { VideoThumbnail } from "../../../../components/ui/video-thumbnail";
import { Button } from "../../../../components/ui/button";

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
  const { deletingIds } = useAtomStore();
  const [visibleCount, setVisibleCount] = useState(12);
  const lastFilterRef = useRef<string>("");

  // Helper to create a filter signature
  const getFilterSignature = () => {
    return JSON.stringify({
      searchTerm,
      selectedContentTypes,
      selectedCreator
    });
  };

  // Only reset visibleCount when filters/search change
  useEffect(() => {
    const filterSignature = getFilterSignature();
    if (lastFilterRef.current !== filterSignature) {
      setVisibleCount(12);
      lastFilterRef.current = filterSignature;
    }
  }, [searchTerm, selectedContentTypes, selectedCreator]);

  const handleAtomClick = (atom: Atom) => {
    navigate(`/detail/${atom.id}`, { replace: true });
    onSelect(atom);
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|webm|ogg)$/i.test(url) || getYouTubeVideoId(url) !== null;
  };

  const capitalizeTag = (tag: string) => {
    return tag
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <>
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
          
          if (isImageType) {
            return (
              <GalleryTile
                key={atom.id}
                className={`relative break-inside-avoid mb-3 p-0 overflow-hidden cursor-pointer group bg-gray-100 select-none focus:outline-none transition-opacity duration-200 ${
                  isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
                }`}
                onClick={() => handleAtomClick(atom)}
              >
                {hasMedia && (
                  <div className="relative w-full">
                    <LazyImage
                      src={mediaUrl}
                      alt={atom.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </GalleryTile>
            );
          }

          // Show video thumbnail for video/youtube in feed
          if (isVideoType) {
            let thumbnailUrl = '';
            let isDirectVideo = false;
            if (atom.content_type === 'youtube' && atom.link) {
              const videoId = getYouTubeVideoId(atom.link);
              if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            } else if (atom.media_source_link) {
              isDirectVideo = true;
              thumbnailUrl = atom.media_source_link;
            }
            return (
              <GalleryTile
                key={atom.id}
                className={`relative break-inside-avoid mb-3 p-0 overflow-hidden cursor-pointer group bg-gray-100 select-none focus:outline-none transition-opacity duration-200 ${
                  isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
                }`}
                onClick={() => handleAtomClick(atom)}
              >
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  {isDirectVideo ? (
                    <VideoThumbnail src={thumbnailUrl} alt={atom.title} className="w-full h-full object-cover" />
                  ) : thumbnailUrl ? (
                    <LazyImage
                      src={thumbnailUrl}
                      alt={atom.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-white opacity-60">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="opacity-80"><path d="M8 5v14l11-7L8 5Z"/></svg>
                  </div>
                </div>
              </GalleryTile>
            );
          }

          return (
            <GalleryTile
              key={atom.id}
              className={`relative break-inside-avoid mb-3 p-0 overflow-hidden cursor-pointer group bg-black select-none focus:outline-none transition-opacity duration-200 ${
                isDeleting ? 'opacity-50 animate-pulse pointer-events-none' : ''
              }`}
              onClick={() => handleAtomClick(atom)}
            >
              <div className="absolute inset-0 bg-black/80 group-hover:bg-black/90 transition-colors" />
              <GalleryTileContent className={`relative px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 flex flex-col text-white min-h-[120px]`}>
                <div className="flex items-start mb-2">
                  {atom.content_type !== 'link' && <ContentBadge type={atom.content_type} />}
                </div>
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
                      <h4 className="text-white text-sm sm:text-base font-medium break-words line-clamp-2">
                        {atom.title}
                      </h4>
                      {atom.description && (
                        <div className="line-clamp-2">
                          <HtmlContent 
                            html={atom.description} 
                            className="text-gray-300 text-sm sm:text-base break-words"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {atom.tags && atom.tags.filter(tag => tag.toLowerCase() !== 'link').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {atom.tags.filter(tag => tag.toLowerCase() !== 'link').map((tag, index, arr) => (
                        <span key={index} className="text-xs text-gray-300">
                          {capitalizeTag(tag)}
                          {index < arr.length - 1 && ","}
                        </span>
                      ))}
                    </div>
                  )}
                  {atom.creator_name && (
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <span className="text-gray-300 text-sm">
                        By
                      </span>
                      <span className="text-white text-sm font-medium break-words">
                        {atom.creator_name}
                      </span>
                    </div>
                  )}
                </div>
                <a
                  href={atom.link || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-white rounded-full p-3 shadow hover:bg-gray-100 transition z-10 border border-gray-200"
                  onClick={e => e.stopPropagation()}
                >
                  <LinkIcon className="w-5 h-5 text-gray-700" />
                </a>
              </GalleryTileContent>
            </GalleryTile>
          );
        })}
      </Masonry>
      {visibleCount < atoms.length && (
        <div className="flex justify-center w-full mt-6">
          <Button
            size="lg"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 12, atoms.length))}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
});

Gallery.displayName = 'Gallery';

export const GallerySection = ({ searchTerm, selectedContentTypes, selectedCreator }: GallerySectionProps): JSX.Element => {
  const { atoms, selectedTags, categories, getCategoryTags, defaultCategoryId } = useAtomStore();
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);

  const filteredAtoms = atoms.filter(atom => {
    const matchesSearch = searchTerm.toLowerCase() === '' || 
      atom.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atom.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <section className="flex flex-col w-full items-center gap-6">
      <Gallery atoms={filteredAtoms} onSelect={setSelectedAtom} searchTerm={searchTerm} selectedContentTypes={selectedContentTypes} selectedCreator={selectedCreator} />
    </section>
  );
};