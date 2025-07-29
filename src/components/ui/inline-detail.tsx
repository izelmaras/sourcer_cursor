import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, TrashIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, BookIcon, FileTextIcon, ImageIcon, LinkIcon, ListIcon, MusicIcon, PlayCircleIcon, UtensilsIcon, VideoIcon, MapPinIcon, FileIcon } from "lucide-react";
import { Database } from '../../types/supabase';
import { useAtomStore } from "../../store/atoms";
import { IconButton } from "./icon-button";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { Input } from "./input";
import { Button } from "./button";
import { CreatorInfo } from "./creator-info";
import { supabase } from '../../lib/supabase';
import { VideoPlayer } from "./video-player";
import { uploadMedia } from '../../lib/storage';
import { isVideoUrl } from '../../lib/utils';

type Atom = Database['public']['Tables']['atoms']['Row'];

interface InlineDetailProps {
  atom: Atom;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onUpdate: (updatedAtom: Atom) => void;
  onDelete: (atomId: number) => void;
}

const ZOOM_SETTINGS = {
  MIN_SCALE: 1,
  MAX_SCALE: 3,
  SCALE_STEP: 0.2,
};

export const InlineDetail: React.FC<InlineDetailProps> = ({ 
  atom, 
  onClose, 
  onNavigate, 
  hasPrevious, 
  hasNext, 
  onUpdate, 
  onDelete 
}) => {
  const { deleteAtom, updateAtom, fetchTags, fetchCreators, tags, fetchAtoms } = useAtomStore();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(ZOOM_SETTINGS.MIN_SCALE);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(atom?.title || '');
  const [editDescription, setEditDescription] = useState(atom?.description || '');
  const [editCreators, setEditCreators] = useState<string[]>(atom?.creator_name ? atom.creator_name.split(',').map(s => s.trim()).filter(Boolean) : []);
  const [editTags, setEditTags] = useState<string[]>(atom?.tags || []);
  const [tagSearch, setTagSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editSourceUrl, setEditSourceUrl] = useState(atom?.media_source_link || '');
    const [editExternalLink, setEditExternalLink] = useState(atom?.link || '');
  const [atomCreators, setAtomCreators] = useState<{ id: number, name: string }[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchCreators();
  }, [fetchTags, fetchCreators]);

  useEffect(() => {
    if (atom) {
      setEditTitle(atom.title);
      setEditDescription(atom.description || '');
      setEditCreators(atom.creator_name ? atom.creator_name.split(',').map(s => s.trim()).filter(Boolean) : []);
      setEditTags(atom.tags || []);
      setEditSourceUrl(atom.media_source_link || '');
      setEditExternalLink(atom.link || '');
    }
  }, [atom]);

  useEffect(() => {
    if (isZoomed) {
      setScale(ZOOM_SETTINGS.MIN_SCALE);
      setPosition({ x: 0, y: 0 });
    }
  }, [isZoomed]);

  useEffect(() => {
    async function fetchAtomCreators() {
      if (!atom?.id) return;
      const { data, error } = await supabase
        .from('atom_creators')
        .select('creator_id, creators(name, id)')
        .eq('atom_id', atom.id);
      if (data) {
        setAtomCreators(data.map((row: any) => ({ id: row.creators.id, name: row.creators.name })));
      } else {
        setAtomCreators([]);
      }
    }
    fetchAtomCreators();
  }, [atom?.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrevious) {
      // Simulate clicking the previous button
      const prevButton = document.querySelector('[data-navigate="prev"]') as HTMLButtonElement;
      console.log('Arrow left pressed, prev button:', prevButton);
      if (prevButton) {
        prevButton.click();
      } else {
        console.log('Prev button not found, calling onNavigate directly');
        onNavigate('prev');
      }
    } else if (e.key === 'ArrowRight' && hasNext) {
      // Simulate clicking the next button
      const nextButton = document.querySelector('[data-navigate="next"]') as HTMLButtonElement;
      console.log('Arrow right pressed, next button:', nextButton);
      if (nextButton) {
        nextButton.click();
      } else {
        console.log('Next button not found, calling onNavigate directly');
        onNavigate('next');
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [hasPrevious, hasNext, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleZoomIn = () => {
    setScale(Math.min(scale + ZOOM_SETTINGS.SCALE_STEP, ZOOM_SETTINGS.MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - ZOOM_SETTINGS.SCALE_STEP, ZOOM_SETTINGS.MIN_SCALE));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!atom) return;
    setIsSaving(true);
    try {
      await updateAtom(atom.id, {
        title: editTitle,
        description: editDescription,
        creator_name: editCreators.join(', '),
        tags: editTags,
        media_source_link: editSourceUrl,
        link: editExternalLink,
        content_type: atom.content_type, // Preserve the current content type
      });
      setIsEditing(false);
      onUpdate({ ...atom, title: editTitle, description: editDescription, creator_name: editCreators.join(', '), tags: editTags, media_source_link: editSourceUrl, link: editExternalLink });
    } catch (error) {
      console.error('Error updating atom:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (atom) {
      try {
        await deleteAtom(atom.id);
        setIsDeleteModalOpen(false);
        onDelete(atom.id);
        onClose();
      } catch (error) {
        console.error('Error deleting atom:', error);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleExternalLink = () => {
    if (atom?.link) {
      window.open(atom.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreatorSelect = (creatorName: string) => {
    useAtomStore.getState().setSelectedCreator(creatorName);
    useAtomStore.getState().setTagDrawerCollapsed(false);
    onClose();
  };

  const handleTagSelect = (tagName: string) => {
    useAtomStore.getState().toggleTag(tagName);
    useAtomStore.getState().setTagDrawerCollapsed(false);
    onClose();
  };

  const handleMediaDrop = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setIsUploadingMedia(true);
    setMediaPreview(URL.createObjectURL(file));
    try {
      const url = await uploadMedia(file);
      setEditSourceUrl(url);
    } catch (error) {
      setMediaPreview(null);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleMainImageDrop = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setIsUploadingMainImage(true);
    try {
      const url = await uploadMedia(file);
      setEditSourceUrl(url);
      setImageLoaded(false);
      if (atom) {
        const updatedAtom = { ...atom, media_source_link: url, thumbnail_path: url };
        await updateAtom(atom.id, { media_source_link: url, thumbnail_path: url });
        onUpdate(updatedAtom);
      }
      await fetchAtoms();
    } catch (error) {
      // Handle error
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  if (!atom) return null;

  const hasMedia = atom.media_source_link && (atom.content_type === 'image' || atom.content_type === 'video');
  const isVideo = hasMedia && isVideoUrl(atom.media_source_link || '');

  const filteredTags = tags
    .filter(tag => 
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !editTags.includes(tag.name)
    )
    .slice(0, 12);

  const showCreateTag = tagSearch && 
    !tags.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) &&
    !editTags.includes(tagSearch);

  const contentTypes = [
    { icon: <ImageIcon className="h-4 w-4 text-white" />, label: "Image", type: "image" },
    { icon: <LinkIcon className="h-4 w-4 text-white" />, label: "Link", type: "link" },
    { icon: <VideoIcon className="h-4 w-4 text-white" />, label: "Video", type: "video" },
    { icon: <PlayCircleIcon className="h-4 w-4 text-white" />, label: "YouTube", type: "youtube" },
    { icon: <FileTextIcon className="h-4 w-4 text-white" />, label: "Note", type: "note" },
    { icon: <BookIcon className="h-4 w-4 text-white" />, label: "Article", type: "article" },
    { icon: <MusicIcon className="h-4 w-4 text-white" />, label: "Music", type: "music" },
    { icon: <MapPinIcon className="h-4 w-4 text-white" />, label: "Location", type: "location" },
    { icon: <UtensilsIcon className="h-4 w-4 text-white" />, label: "Recipe", type: "recipe" },
    { icon: <ListIcon className="h-4 w-4 text-white" />, label: "Task", type: "task" },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">
            {atom.title || 'Untitled'}
          </h2>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <IconButton
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={!hasPrevious}
              data-navigate="prev"
            >
              <ChevronLeftIcon className="w-4 h-4 text-white" />
            </IconButton>
            <IconButton
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={!hasNext}
              data-navigate="next"
            >
              <ChevronRightIcon className="w-4 h-4 text-white" />
            </IconButton>
          </div>
          
          {/* Actions */}
          <IconButton
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-white hover:text-red-200 hover:bg-red-500/20"
          >
            <TrashIcon className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <PencilIcon className="w-4 h-4 text-white" />
          </IconButton>
          <IconButton
            size="sm"
            onClick={onClose}
          >
            <XIcon className="w-4 h-4 text-white" />
          </IconButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Media Section */}
        <div className="flex-1 p-4 lg:p-6">
          {hasMedia && (
            <div className="relative bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-lg overflow-hidden mb-4 border border-white/5 min-h-[200px]">
              {isVideo ? (
                <VideoPlayer
                  src={atom.media_source_link || ''}
                  className="w-full h-full object-contain"
                  controls={true}
                  autoPlay={false}
                  muted={false}
                />
              ) : (
                <img
                  src={atom.media_source_link || '/placeholder-image.png'}
                  alt={atom.title || 'Media'}
                  className="w-full h-full object-contain"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    const container = img.parentElement;
                    if (container && img.naturalWidth && img.naturalHeight) {
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      const containerWidth = container.clientWidth;
                      const containerHeight = container.clientHeight;
                      
                      // If image is wider than container aspect ratio, fit to width
                      if (aspectRatio > containerWidth / containerHeight) {
                        img.style.width = '100%';
                        img.style.height = 'auto';
                      } else {
                        // If image is taller, fit to height
                        img.style.width = 'auto';
                        img.style.height = '100%';
                      }
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Description */}
          {atom.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white/90 mb-2">Description</h3>
              <p className="text-sm text-white/80 leading-relaxed">{atom.description}</p>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/50"
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 resize-none"
                  rows={4}
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Source Link</label>
                <Input
                  value={editSourceUrl}
                  onChange={(e) => setEditSourceUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/50"
                  placeholder="Enter source URL..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">External Link</label>
                <Input
                  value={editExternalLink}
                  onChange={(e) => setEditExternalLink(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/50"
                  placeholder="Enter external URL..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        console.log('Content type button clicked:', type.type);
                        const updatedAtom = { ...atom, content_type: type.type };
                        console.log('Updated atom:', updatedAtom);
                        onUpdate(updatedAtom);
                      }}
                      className={`px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${
                        atom.content_type === type.type
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-white/10 text-white rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => setEditTags(editTags.filter((_, i) => i !== index))}
                        className="text-white/70 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    color="glass"
                    placeholder="Search or add tags..."
                  />
                  {showCreateTag && (
                    <Button
                      onClick={() => {
                        setEditTags([...editTags, tagSearch]);
                        setTagSearch('');
                      }}
                      className="bg-white/10 text-white border-white/20"
                    >
                      Add
                    </Button>
                  )}
                </div>
                {tagSearch && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setEditTags([...editTags, tag.name]);
                          setTagSearch('');
                        }}
                        className="block w-full text-left px-2 py-1 text-sm text-white/80 hover:bg-white/10 rounded"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-white/10 text-white border-white/20"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-white/5 text-white border-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 bg-white/2 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-white/5">
          {/* Creator Info */}
          {atom.creator_name && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/90 mb-2">Creator</h3>
              <div 
                className="cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => atom.creator_name && handleCreatorSelect(atom.creator_name)}
              >
                <CreatorInfo name={atom.creator_name} />
              </div>
            </div>
          )}

          {/* Content Type */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white/90 mb-2">Content Type</h3>
            <div className="flex items-center gap-2">
              {contentTypes.find(ct => ct.type === atom.content_type)?.icon || <FileIcon className="h-4 w-4 text-white" />}
              <span className="text-sm text-white/80 capitalize">
                {atom.content_type?.replace('-', ' ') || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Created Date */}
          {atom.created_at && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/90 mb-2">Created</h3>
              <p className="text-sm text-white/80">
                {new Date(atom.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Tags */}
          {atom.tags && atom.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/90 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {atom.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-white/8 backdrop-blur-sm text-white/90 rounded-md border border-white/10 cursor-pointer hover:bg-white/15 transition-colors"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          {atom.link && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/90 mb-2">External Link</h3>
              <a
                href={atom.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-white/80 underline break-all"
                title={atom.link}
              >
                {atom.link}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={atom.title || 'Untitled'}
      />
    </div>
  );
}; 