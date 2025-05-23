import { LinkIcon } from "lucide-react";
import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ContentBadge } from "../../../../components/ui/content-badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { useAtomStore } from "../../../../store/atoms";
import { Database } from "../../../../types/supabase";
import { LazyImage } from "../../../../components/ui/lazy-image";
import { HtmlContent } from "../../../../components/ui/html-content";
import { VideoPlayer } from "../../../../components/ui/video-player";
import { getYouTubeVideoId } from "../../../../lib/utils";

type Atom = Database['public']['Tables']['atoms']['Row'];

interface FrameByAnimaProps {
  searchTerm: string;
  selectedContentTypes: string[];
  selectedCreator: string | null;
}

const Gallery = memo(({ atoms, onSelect }: { 
  atoms: Atom[], 
  onSelect: (atom: Atom) => void 
}) => {
  const navigate = useNavigate();
  
  const handleAtomClick = (atom: Atom) => {
    navigate(`/detail/${atom.id}`);
    onSelect(atom);
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|webm|ogg)$/i.test(url) || getYouTubeVideoId(url) !== null;
  };

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 w-full">
      {atoms.map((atom) => {
        const isImageType = atom.content_type === 'image';
        const isVideoType = atom.content_type === 'video' || atom.content_type === 'youtube';
        const hasMedia = (isImageType || isVideoType) && (atom.media_source_link || atom.link);
        const mediaUrl = atom.media_source_link || atom.link || '';
        const isVideo = hasMedia && isVideoUrl(mediaUrl);
        
        if (isImageType || isVideoType) {
          return (
            <Card
              key={atom.id}
              className="relative break-inside-avoid mb-3 p-0 overflow-hidden cursor-pointer group bg-gray-100 select-none focus:outline-none"
              onClick={() => handleAtomClick(atom)}
            >
              {hasMedia && (
                <div className="relative w-full">
                  {isVideo ? (
                    <VideoPlayer
                      src={mediaUrl}
                      className="w-full h-auto"
                      controls={false}
                      autoPlay={false}
                      muted={true}
                      loop={true}
                    />
                  ) : (
                    <LazyImage
                      src={mediaUrl}
                      alt={atom.title}
                      className="w-full h-auto object-cover"
                    />
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </Card>
          );
        }

        return (
          <Card
            key={atom.id}
            className="relative break-inside-avoid mb-3 p-0 overflow-hidden cursor-pointer group bg-gray-50 select-none focus:outline-none"
            onClick={() => handleAtomClick(atom)}
          >
            <CardContent className="relative p-4 sm:p-6 flex flex-col gap-2">
              <div className="flex items-start">
                <ContentBadge type={atom.content_type} />
              </div>

              {atom.title && atom.title !== ' ' && (
                <div className="space-y-1">
                  <h4 className="text-gray-900 text-sm sm:text-base font-medium break-words line-clamp-2">
                    {atom.title}
                  </h4>
                  {atom.description && (
                    <div className="line-clamp-2">
                      <HtmlContent 
                        html={atom.description} 
                        className="text-gray-600 text-sm sm:text-base break-words"
                      />
                    </div>
                  )}
                </div>
              )}

              {atom.creator_name && (
                <div className="flex flex-wrap items-center gap-1 mt-auto">
                  <span className="text-gray-500 text-sm sm:text-base">
                    By
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base font-medium break-words">
                    {atom.creator_name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

Gallery.displayName = 'Gallery';

export const FrameByAnima = ({ searchTerm, selectedContentTypes, selectedCreator }: FrameByAnimaProps): JSX.Element => {
  const { atoms, selectedTags, categories, getCategoryTags, defaultCategoryId } = useAtomStore();
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);

  const filteredAtoms = atoms.filter(atom => {
    const matchesSearch = searchTerm.toLowerCase() === '' || 
      atom.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atom.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedContentTypes.length === 0 || selectedContentTypes.includes(atom.content_type);
    
    const matchesCreator = !selectedCreator || atom.creator_name === selectedCreator;

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

    return matchesSearch && 
           matchesType && 
           matchesCreator &&
           !isInPrivateCategory &&
           !selectedTagsInPrivateCategories &&
           matchesDefaultCategory &&
           matchesFlagged &&
           (selectedTags.length === 0 || selectedTags.every(tag => tag === 'flagged' || atomTags.includes(tag)));
  });

  return (
    <section className="flex flex-col w-full items-center gap-6">
      <Gallery atoms={filteredAtoms} onSelect={setSelectedAtom} />
    </section>
  );
};