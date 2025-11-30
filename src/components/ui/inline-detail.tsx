import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, TrashIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, BookIcon, FileTextIcon, ImageIcon, LinkIcon, ListIcon, MusicIcon, PlayCircleIcon, UtensilsIcon, VideoIcon, MapPinIcon, FileIcon, CopyIcon } from "lucide-react";
import { Database } from '../../types/supabase';
import { useAtomStore } from "../../store/atoms";
import { IconButton } from "./icon-button";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { Input } from "./input";
import { Button } from "./button";
import { SearchBar } from "./search-bar";
import { CreatorInfo } from "./creator-info";
import { supabase } from '../../lib/supabase';
import { VideoPlayer } from "./video-player";
import { uploadMedia } from '../../lib/storage';
import { isVideoUrl } from '../../lib/utils';
import { backgrounds, borders, text, icons, radius, tags, textarea as textareaTokens, utilities } from '../../lib/design-tokens';

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
  const { deleteAtom, updateAtom, fetchTags, fetchCreators, tags, creators, fetchAtoms, addCreator, addAtom } = useAtomStore();
  
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
  const [creatorSearch, setCreatorSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editSourceUrl, setEditSourceUrl] = useState(atom?.media_source_link || '');
  const [editExternalLink, setEditExternalLink] = useState(atom?.link || '');
  const [editPrompt, setEditPrompt] = useState(atom?.prompt || '');
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
      setEditTags(atom.tags || []);
      setEditSourceUrl(atom.media_source_link || '');
      setEditExternalLink(atom.link || '');
      setEditPrompt(atom.prompt || '');
    }
  }, [atom]);

  useEffect(() => {
    if (atomCreators.length > 0) {
      setEditCreators(atomCreators.map(c => c.name));
    } else if (atom?.creator_name) {
      setEditCreators(atom.creator_name.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setEditCreators([]);
    }
  }, [atomCreators, atom?.creator_name]);

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
      for (const creatorName of editCreators) {
        if (!creators.find(c => c.name === creatorName)) {
          await addCreator({ name: creatorName, count: 1 });
        }
      }
      await updateAtom(atom.id, {
        title: editTitle,
        description: editDescription,
        creator_name: editCreators.join(', '),
        tags: editTags,
        media_source_link: editSourceUrl,
        link: editExternalLink,
        prompt: editPrompt,
        content_type: atom.content_type, // Preserve the current content type
      });
      await fetchCreators();
      setIsEditing(false);
      onUpdate({ ...atom, title: editTitle, description: editDescription, creator_name: editCreators.join(', '), tags: editTags, media_source_link: editSourceUrl, link: editExternalLink, prompt: editPrompt });
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

  const handleDuplicate = async () => {
    if (!atom) return;
    try {
      // Prepare new atom data, omitting id, created_at, updated_at
      const {
        id, created_at, updated_at, ...rest
      } = atom;
      
      // Create duplicate atom
      const newAtom = await addAtom({
        ...rest,
        title: rest.title || 'Untitled',
        store_in_database: true,
      });
      
      if (newAtom) {
        // Refresh the feed to show the new atom
        await fetchAtoms();
        // Close the detail view - the duplicate will appear in the feed
        onClose();
      }
    } catch (error) {
      console.error('Error duplicating atom:', error);
    }
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

  const filteredCreators = creators
    .filter(creator => 
      creator.name.toLowerCase().includes(creatorSearch.toLowerCase()) &&
      !editCreators.includes(creator.name)
    )
    .slice(0, 12);

  const showCreateCreator = creatorSearch && 
    !creators.find(c => c.name.toLowerCase() === creatorSearch.toLowerCase()) &&
    !editCreators.includes(creatorSearch);

  const contentTypes = [
    { icon: <ImageIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Image", type: "image" },
    { icon: <LinkIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Link", type: "link" },
    { icon: <VideoIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Video", type: "video" },
    { icon: <PlayCircleIcon className={`h-4 w-4 ${icons.primary}`} />, label: "YouTube", type: "youtube" },
    { icon: <FileTextIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Note", type: "note" },
    { icon: <BookIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Article", type: "article" },
    { icon: <MusicIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Music", type: "music" },
    { icon: <MapPinIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Location", type: "location" },
    { icon: <UtensilsIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Recipe", type: "recipe" },
    { icon: <ListIcon className={`h-4 w-4 ${icons.primary}`} />, label: "Task", type: "task" },
  ];

  return (
    <div className={`${backgrounds.layer2Strong} ${radius.md} shadow-2xl ${borders.tertiary} overflow-hidden`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className={`text-lg font-semibold ${text.primary} truncate`}>
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
              <ChevronLeftIcon className={`w-4 h-4 ${icons.primary}`} />
            </IconButton>
            <IconButton
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={!hasNext}
              data-navigate="next"
            >
              <ChevronRightIcon className={`w-4 h-4 ${icons.primary}`} />
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
            <PencilIcon className={`w-4 h-4 ${icons.primary}`} />
          </IconButton>
          <IconButton
            size="sm"
            onClick={handleDuplicate}
            className="text-white hover:text-blue-200 hover:bg-blue-500/20"
          >
            <CopyIcon className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="sm"
            onClick={onClose}
          >
            <XIcon className={`w-4 h-4 ${icons.primary}`} />
          </IconButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Media Section */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Edit Mode - appears above image when editing */}
          {isEditing && (
            <>
              {/* Edit Form */}
              <div className={`space-y-4 p-4 ${backgrounds.layer2} ${radius.md} ${borders.tertiary} mb-4`}>
                {/* Save/Cancel buttons at top of form */}
                <div className="flex gap-2 pb-2 border-b border-white/10">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => {
                          const updatedAtom = { ...atom, content_type: type.type };
                          onUpdate(updatedAtom);
                        }}
                        className={`px-3 py-2 text-sm ${radius.sm} ${utilities.transition.all} flex items-center gap-2 ${
                          atom.content_type === type.type
                            ? `${backgrounds.selected.layer2} ${text.primary} ${borders.secondary}`
                            : `${backgrounds.layer2} ${text.secondary} ${borders.tertiary} ${backgrounds.hover.layer3} ${text.hover}`
                        }`}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Creators</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editCreators.map((creator, index) => (
                      <span
                        key={index}
                        className={tags.variants.removable.className}
                      >
                        {creator}
                        <button
                          onClick={() => setEditCreators(editCreators.filter((_, i) => i !== index))}
                          className="text-white/70 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <SearchBar
                      value={creatorSearch}
                      onChange={(e) => setCreatorSearch(e.target.value)}
                      placeholder="Search or add creators..."
                      className="flex-1"
                    />
                    {showCreateCreator && (
                      <Button
                        onClick={async () => {
                          if (creatorSearch && !creators.find(c => c.name === creatorSearch)) {
                            await addCreator({ name: creatorSearch, count: 1 });
                            await fetchCreators();
                          }
                          setEditCreators([...editCreators, creatorSearch]);
                          setCreatorSearch('');
                        }}
                        className="bg-white/10 text-white border-white/20"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                  {creatorSearch && (
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {filteredCreators.map((creator) => (
                        <button
                          key={creator.id}
                          onClick={() => {
                            setEditCreators([...editCreators, creator.name]);
                            setCreatorSearch('');
                          }}
                          className="block w-full text-left px-2 py-1 text-sm text-white/80 hover:bg-white/10 rounded"
                        >
                          {creator.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTags.map((tag, index) => (
                      <span
                        key={index}
                        className={tags.variants.removable.className}
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
                    <SearchBar
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search or add tags..."
                      className="flex-1"
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
                
                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    color="glass"
                    placeholder="Enter title..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={textareaTokens.base.className}
                    rows={4}
                    placeholder="Enter description..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>Source Link</label>
                  <Input
                    value={editSourceUrl}
                    onChange={(e) => setEditSourceUrl(e.target.value)}
                    color="glass"
                    placeholder="Enter source URL..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-2`}>External Link</label>
                  <Input
                    value={editExternalLink}
                    onChange={(e) => setEditExternalLink(e.target.value)}
                    color="glass"
                    placeholder="Enter external URL..."
                  />
                </div>

                {/* Prompt field - only show for image and video types */}
                {(atom.content_type === 'image' || atom.content_type === 'video') && (
                  <div>
                    <label className={`block text-sm font-medium ${text.primary} mb-2`}>Prompt</label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className={textareaTokens.base.className}
                      rows={3}
                      placeholder="Enter AI generation prompt..."
                    />
                  </div>
                )}
              </div>
            </>
          )}
          
          {hasMedia && (
            <div className={`relative ${backgrounds.layer1} flex items-center justify-center ${radius.md} overflow-hidden mb-4 ${borders.quaternary} min-h-[200px]`}>
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
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Description</h3>
              <p className={`text-sm ${text.secondary} leading-relaxed`}>{atom.description}</p>
            </div>
          )}

          {/* Prompt - only show for image and video types if populated (non-edit mode) */}
          {!isEditing && atom.prompt && (atom.content_type === 'image' || atom.content_type === 'video') && (
            <div className="mb-4">
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Prompt</h3>
              <p className={`text-sm ${text.secondary} leading-relaxed ${backgrounds.layer2} p-3 ${radius.md} ${borders.tertiary}`}>
                {atom.prompt}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`w-full lg:w-80 p-4 lg:p-6 ${backgrounds.layer4} border-t lg:border-t-0 lg:border-l ${borders.quaternary}`}>
          {/* Creator Info */}
          {(atomCreators.length > 0 || atom.creator_name) && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Creator{atomCreators.length > 1 || (atom.creator_name && atom.creator_name.split(',').length > 1) ? 's' : ''}</h3>
              {atomCreators.length > 0 ? (
                <div className="space-y-2">
                  {atomCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className={`cursor-pointer ${backgrounds.hover.layer5} ${radius.md} p-2 -m-2 ${utilities.transition.colors}`}
                      onClick={() => handleCreatorSelect(creator.name)}
                    >
                      <CreatorInfo name={creator.name} />
                    </div>
                  ))}
                </div>
              ) : atom.creator_name ? (
                <div 
                  className="cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleCreatorSelect(atom.creator_name)}
                >
                  <CreatorInfo name={atom.creator_name} />
                </div>
              ) : null}
            </div>
          )}

          {/* Content Type */}
          <div className="mb-6">
            <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Content Type</h3>
            <div className="flex items-center gap-2">
              {contentTypes.find(ct => ct.type === atom.content_type)?.icon || <FileIcon className={`h-4 w-4 ${icons.primary}`} />}
              <span className={`text-sm ${text.secondary} capitalize`}>
                {atom.content_type?.replace('-', ' ') || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Created Date */}
          {atom.created_at && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Created</h3>
              <p className={`text-sm ${text.secondary}`}>
                {new Date(atom.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Tags */}
          {atom.tags && atom.tags.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {atom.tags.map((tag) => (
                  <span
                    key={tag}
                    className={tags?.variants?.clickable?.className || tags?.clickable?.className || 'px-2 py-1 text-xs bg-white/8 backdrop-blur-sm text-white/90 rounded-md border border-white/10 cursor-pointer hover:bg-white/15 transition-colors'}
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
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>External Link</h3>
              <a
                href={atom.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${text.primary} ${text.hover} underline break-all`}
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