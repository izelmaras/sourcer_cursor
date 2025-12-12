import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, TrashIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, BookIcon, FileTextIcon, ImageIcon, LinkIcon, ListIcon, MusicIcon, PlayCircleIcon, UtensilsIcon, VideoIcon, MapPinIcon, FileIcon, CopyIcon, FilterIcon, LightbulbIcon, MinusIcon, PlusIcon, LayersIcon, EyeIcon, EyeOffIcon } from "lucide-react";
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
import { isVideoUrl, getProxiedImageUrl } from '../../lib/utils';
import { LiveLinkPreview } from './LiveLinkPreview';
import { backgrounds, borders, text, icons, radius, tags as tagStyles, textarea as textareaTokens, utilities } from '../../lib/design-tokens';
import { useNavigate } from "react-router-dom";

type Atom = Database['public']['Tables']['atoms']['Row'];

interface InlineDetailProps {
  atom: Atom;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onUpdate: (updatedAtom: Atom) => void;
  onDelete: (atomId: number) => void;
  onOpenAtom?: (atom: Atom) => void;
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
  onDelete,
  onOpenAtom
}) => {
  const { deleteAtom, updateAtom, fetchTags, fetchCreators, tags, creators, fetchAtoms, addCreator, addAtom, fetchChildAtoms, addChildAtom, removeChildAtom, fetchParentAtoms, atoms: allAtoms } = useAtomStore();
  const navigate = useNavigate();
  
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
  const [parentIdeas, setParentIdeas] = useState<Atom[]>([]);
  const [isLoadingParentIdeas, setIsLoadingParentIdeas] = useState(false);
  const [isEditingParentIdeas, setIsEditingParentIdeas] = useState(false);
  const [parentIdeaSearch, setParentIdeaSearch] = useState('');
  const [selectedParentIdeas, setSelectedParentIdeas] = useState<number[]>([]);
  const [childAtomCount, setChildAtomCount] = useState<number>(0);
  const [isLoadingChildCount, setIsLoadingChildCount] = useState(false);
  const [childAtoms, setChildAtoms] = useState<Atom[]>([]);
  const [isLoadingChildAtoms, setIsLoadingChildAtoms] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(20); // For lazy loading tags

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

  // Fetch parent ideas (ideas that contain this atom)
  useEffect(() => {
    const fetchParents = async () => {
      if (atom?.id && atom.content_type !== 'idea') {
        setIsLoadingParentIdeas(true);
        try {
          const parents = await fetchParentAtoms(atom.id);
          setParentIdeas(parents);
          setSelectedParentIdeas(parents.map(p => p.id));
        } catch (error) {
          console.error('Error fetching parent ideas:', error);
          setParentIdeas([]);
        } finally {
          setIsLoadingParentIdeas(false);
        }
      } else {
        setParentIdeas([]);
        setSelectedParentIdeas([]);
      }
    };
    if (atom?.id) {
      fetchParents();
    }
  }, [atom?.id, atom?.content_type, fetchParentAtoms]);

  // Fetch child atom count for ideas
  useEffect(() => {
    const fetchChildCount = async () => {
      if (atom?.id && atom.content_type === 'idea') {
        setIsLoadingChildCount(true);
        try {
          const children = await fetchChildAtoms(atom.id);
          setChildAtomCount(children.length);
        } catch (error) {
          console.error('Error fetching child atoms:', error);
          setChildAtomCount(0);
        } finally {
          setIsLoadingChildCount(false);
        }
      } else {
        setChildAtomCount(0);
      }
    };
    if (atom?.id) {
      fetchChildCount();
    }
  }, [atom?.id, atom?.content_type, fetchChildAtoms]);

  // Fetch child atoms list for ideas
  useEffect(() => {
    const fetchChildren = async () => {
      if (atom?.id && atom.content_type === 'idea') {
        setIsLoadingChildAtoms(true);
        try {
          const children = await fetchChildAtoms(atom.id);
          setChildAtoms(children);
          setVisibleTagCount(20); // Reset lazy loading when atom changes
        } catch (error) {
          console.error('Error fetching child atoms list:', error);
          setChildAtoms([]);
        } finally {
          setIsLoadingChildAtoms(false);
        }
      } else {
        setChildAtoms([]);
        setVisibleTagCount(20); // Reset lazy loading
      }
    };
    if (atom?.id) {
      fetchChildren();
    }
  }, [atom?.id, atom?.content_type, fetchChildAtoms]);

  // Check if all child atoms are hidden (treat null as false)
  const allChildAtomsHidden = childAtoms.length > 0 && childAtoms.every(a => a.hidden === true);
  // Check if any child atom is hidden (treat null as false)
  const anyChildAtomHidden = childAtoms.length > 0 && childAtoms.some(a => a.hidden === true);

  // Hide/show all child atoms of an idea
  const handleToggleHideAllChildAtoms = async () => {
    if (!atom?.id || atom.content_type !== 'idea' || childAtoms.length === 0) return;
    
    try {
      // If any are hidden, unhide all; otherwise hide all
      const hideValue = !anyChildAtomHidden;
      const childAtomIds = childAtoms.map(c => c.id);
      
      // Update all child atoms in the database - updateAtom already updates the store
      await Promise.all(
        childAtomIds.map(id => updateAtom(id, { hidden: hideValue }))
      );
      
      // Update local childAtoms state immediately
      setChildAtoms(prev => prev.map(a => ({ ...a, hidden: hideValue })));
      
      // The store is already updated by updateAtom, so the grid should automatically filter them out
    } catch (error) {
      console.error('Error toggling hide all child atoms:', error);
    }
  };

  // Toggle hide/unhide for a specific child atom
  const handleToggleHideChildAtom = async (childAtomId: number) => {
    if (!atom?.id || atom.content_type !== 'idea') return;
    
    try {
      // Find the current hidden state of this atom
      const childAtom = childAtoms.find(a => a.id === childAtomId);
      const currentHidden = childAtom?.hidden === true;
      
      // Toggle the hidden state
      await updateAtom(childAtomId, { hidden: !currentHidden });
      
      // Update local state immediately for better UX
      setChildAtoms(prev => prev.map(a => 
        a.id === childAtomId 
          ? { ...a, hidden: !currentHidden }
          : a
      ));
      
      // Refresh the child atoms list to ensure consistency
      const children = await fetchChildAtoms(atom.id);
      setChildAtoms(children);
      
      // The store is already updated by updateAtom, so the grid should automatically update
    } catch (error) {
      console.error('Error toggling hide child atom:', error);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default behavior for arrow keys to avoid scrolling
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (e.key === 'ArrowLeft' && hasPrevious) {
      // Simulate clicking the previous button
      const prevButton = document.querySelector('[data-navigate="prev"]') as HTMLButtonElement;
      if (prevButton && !prevButton.disabled) {
        prevButton.click();
      } else {
        onNavigate('prev');
      }
    } else if (e.key === 'ArrowRight' && hasNext) {
      // Simulate clicking the next button
      const nextButton = document.querySelector('[data-navigate="next"]') as HTMLButtonElement;
      if (nextButton && !nextButton.disabled) {
        nextButton.click();
      } else {
        onNavigate('next');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
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

  const handleAddParentIdea = async (ideaId: number) => {
    if (!atom?.id) return;
    try {
      await addChildAtom(ideaId, atom.id);
      const parents = await fetchParentAtoms(atom.id);
      setParentIdeas(parents);
      setSelectedParentIdeas(parents.map(p => p.id));
      setParentIdeaSearch('');
    } catch (error) {
      console.error('Error adding parent idea:', error);
    }
  };

  const handleRemoveParentIdea = async (ideaId: number) => {
    if (!atom?.id) return;
    try {
      await removeChildAtom(ideaId, atom.id);
      const parents = await fetchParentAtoms(atom.id);
      setParentIdeas(parents);
      setSelectedParentIdeas(parents.map(p => p.id));
    } catch (error) {
      console.error('Error removing parent idea:', error);
    }
  };


  const availableIdeasForParents = React.useMemo(() => {
    if (!atom || atom.content_type === 'idea') return [];
    const parentIds = new Set(parentIdeas.map(p => p.id));
    return allAtoms.filter(idea => 
      idea.content_type === 'idea' &&
      idea.id !== atom.id &&
      !parentIds.has(idea.id) &&
      (!parentIdeaSearch || 
        idea.title?.toLowerCase().includes(parentIdeaSearch.toLowerCase()) ||
        idea.description?.toLowerCase().includes(parentIdeaSearch.toLowerCase()))
    );
  }, [allAtoms, atom, parentIdeas, parentIdeaSearch]);

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

  const hasMedia = atom.media_source_link && (atom.content_type === 'image' || atom.content_type === 'video' || atom.content_type === 'movie');
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

  const isIdea = atom.content_type === 'idea';
  
  return (
    <div className={`${isIdea ? 'bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-transparent border-orange-300/20' : `${backgrounds.layer2Strong} ${borders.tertiary}`} ${radius.md} shadow-2xl overflow-y-auto max-h-[90vh] border border-white/30`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className={`text-lg font-semibold ${text.primary} truncate`}>
            {atom.title || 'Untitled'}
          </h2>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Filter icon for ideas */}
          {atom?.content_type === 'idea' && (
            <IconButton 
              onClick={() => {
                navigate(`/?filterIdea=${atom.id}`);
                onClose();
              }} 
              size="sm"
              title="Filter gallery by this idea"
              className="px-3 w-auto min-w-[2rem]"
            >
              <div className="flex items-center gap-1.5">
                <FilterIcon className={`w-4 h-4 ${icons.primary}`} />
                {!isLoadingChildCount && childAtomCount > 0 && (
                  <span className={`text-xs ${text.primary}`}>{childAtomCount}</span>
                )}
              </div>
            </IconButton>
          )}

          {/* Hide/Show all inspirations for ideas */}
          {atom?.content_type === 'idea' && (
            <IconButton 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Eye icon clicked!', { childAtomsLength: childAtoms.length });
                handleToggleHideAllChildAtoms();
              }}
              size="sm"
              title={anyChildAtomHidden ? "Show all inspirations in grid" : "Hide all inspirations from grid"}
              disabled={childAtoms.length === 0}
            >
              {anyChildAtomHidden ? (
                <EyeOffIcon className={`w-4 h-4 ${icons.primary}`} />
              ) : (
                <EyeIcon className={`w-4 h-4 ${icons.primary}`} />
              )}
            </IconButton>
          )}
          
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
            className="text-white hover:text-white hover:bg-white/10"
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
        <div className="flex-1 p-4">
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
                  <div className="flex flex-wrap gap-2 md:gap-3">
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
                  <div className="flex flex-wrap gap-2 md:gap-3 mb-2">
                    {editCreators.map((creator, index) => (
                      <span
                        key={index}
                        className={tagStyles?.variants?.removable?.className || 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1 hover:bg-white/20 transition-colors'}
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
                  <div className="flex flex-wrap gap-2 md:gap-3 mb-2">
                    {editTags.map((tag, index) => (
                      <span
                        key={index}
                        className={tagStyles?.variants?.removable?.className || 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1 hover:bg-white/20 transition-colors'}
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
            <div className={`relative ${backgrounds.layer1} flex items-center justify-center ${radius.md} overflow-hidden mb-4 ${borders.quaternary} min-h-[200px] max-h-[60vh]`}>
              {isVideo ? (
                <VideoPlayer
                  src={atom.media_source_link || ''}
                  className="w-full h-full object-contain max-h-[60vh]"
                  controls={true}
                  autoPlay={false}
                  muted={false}
                />
              ) : (
                <img
                  src={atom.media_source_link ? getProxiedImageUrl(atom.media_source_link) : '/placeholder-image.png'}
                  alt={atom.title || 'Media'}
                  className="w-full h-full object-contain max-h-[60vh]"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    const container = img.parentElement;
                    if (container && img.naturalWidth && img.naturalHeight) {
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      const containerWidth = container.clientWidth;
                      const containerHeight = Math.min(container.clientHeight, window.innerHeight * 0.6); // Limit to 60vh
                      
                      // If image is wider than container aspect ratio, fit to width
                      if (aspectRatio > containerWidth / containerHeight) {
                        img.style.width = '100%';
                        img.style.height = 'auto';
                        img.style.maxHeight = '60vh';
                      } else {
                        // If image is taller, fit to height (but respect viewport limit)
                        img.style.width = 'auto';
                        img.style.height = '100%';
                        img.style.maxHeight = '60vh';
                      }
                    }
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = '/placeholder-image.png';
                    img.onerror = null; // Prevent infinite loop if placeholder also fails
                  }}
                />
              )}
            </div>
          )}

          {/* Description */}
          {atom.description && (
            <div className="mb-4">
              <p className={`text-sm ${text.secondary} leading-relaxed`}>{atom.description}</p>
            </div>
          )}

          {/* Inspirations - Only for idea atoms, shown as previews below description */}
          {atom?.content_type === 'idea' && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${text.primary} mb-3`}>
                Inspirations
                {isLoadingChildAtoms && <span className="text-xs text-white/50">(loading...)</span>}
              </h3>
              {isLoadingChildAtoms ? (
                <div className={`text-xs ${text.tertiary} text-center py-2`}>Loading...</div>
              ) : childAtoms.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {childAtoms.map((childAtom) => {
                    // Generate consistent random rotation between -15 and 15 degrees based on atom ID
                    const rotation = ((childAtom.id * 137.508) % 30) - 15;
                    return (
                    <div
                      key={childAtom.id}
                      className={`group cursor-pointer ${backgrounds.layer2} ${borders.secondary} ${radius.md} overflow-hidden transition-all duration-300 ${backgrounds.hover.layer1} relative aspect-square ${utilities.shadow.lg}`}
                      style={{ transform: `rotate(${rotation}deg)` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1.05)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                      }}
                      onClick={() => {
                        if (onOpenAtom) {
                          onOpenAtom(childAtom);
                        } else {
                          onClose();
                          navigate(`/detail/${childAtom.id}`);
                        }
                      }}
                    >
                      {/* Preview Image/Media */}
                      {childAtom.media_source_link ? (
                        <div className="absolute inset-0 w-full h-full">
                          {childAtom.content_type === 'image' ? (
                            <img
                              src={getProxiedImageUrl(childAtom.media_source_link)}
                              alt={childAtom.title || 'Untitled'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : childAtom.content_type === 'video' && isVideoUrl(childAtom.media_source_link) ? (
                            <VideoPlayer
                              url={childAtom.media_source_link}
                              autoplay={false}
                              controls={false}
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 via-yellow-300/20 via-amber-300/15 to-yellow-400/25"></div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-400/30 via-yellow-300/20 via-amber-300/15 to-yellow-400/25"></div>
                      )}
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/15 to-transparent">
                        <div className={`text-sm font-medium ${text.primary} line-clamp-2 break-words overflow-hidden`}>
                          {childAtom.title || 'Untitled'}
                        </div>
                      </div>
                      
                      {/* Eye icon for toggling hide/unhide - always visible */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleHideChildAtom(childAtom.id);
                        }}
                        className="absolute top-2 right-2 z-20 p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                        title={childAtom.hidden === true ? "Unhide this inspiration" : "Hide this inspiration"}
                        style={{ pointerEvents: 'auto' }}
                      >
                        {childAtom.hidden === true ? (
                          <EyeOffIcon className={`w-4 h-4 ${icons.primary}`} />
                        ) : (
                          <EyeIcon className={`w-4 h-4 ${icons.primary}`} />
                        )}
                      </button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-xs ${text.tertiary} text-center py-2`}>
                  No inspirations
                </div>
              )}
            </div>
          )}

          {/* Tags Ribbon - Only for idea atoms, showing tags from child atoms */}
          {atom?.content_type === 'idea' && childAtoms.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${text.primary} mb-3`}>
                Tags from Inspirations
              </h3>
              {(() => {
                // Collect all tags from child atoms with their most recent usage date
                const tagMap = new Map<string, Date>();
                childAtoms.forEach((childAtom) => {
                  if (childAtom.tags && childAtom.tags.length > 0 && childAtom.created_at) {
                    const tagDate = new Date(childAtom.created_at);
                    childAtom.tags.forEach((tag) => {
                      const normalizedTag = tag.toLowerCase().trim();
                      const existingDate = tagMap.get(normalizedTag);
                      if (!existingDate || tagDate > existingDate) {
                        tagMap.set(normalizedTag, tagDate);
                      }
                    });
                  }
                });

                // Convert to array and sort by most recent (newest first)
                const sortedTags = Array.from(tagMap.entries())
                  .sort((a, b) => b[1].getTime() - a[1].getTime())
                  .map(([tag]) => tag);

                if (sortedTags.length === 0) {
                  return (
                    <div className={`text-xs ${text.tertiary} text-center py-2`}>
                      No tags from inspirations
                    </div>
                  );
                }

                const visibleTags = sortedTags.slice(0, visibleTagCount);
                const hasMore = sortedTags.length > visibleTagCount;

                return (
                  <div className="relative">
                    <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
                      {visibleTags.map((tag) => (
                        <span
                          key={tag}
                          className={tagStyles?.variants?.clickable?.className || tagStyles?.clickable?.className || 'px-2 py-1 text-xs bg-white/8 backdrop-blur-sm text-white/90 rounded-md border border-white/10 cursor-pointer hover:bg-white/15 transition-colors whitespace-nowrap'}
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                      {hasMore && (
                        <button
                          onClick={() => setVisibleTagCount(prev => prev + 20)}
                          className={`px-2 py-1 text-xs ${backgrounds.layer2} ${text.secondary} rounded-md border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap`}
                        >
                          +{sortedTags.length - visibleTagCount} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Prompt - only show for image, video, and movie types if populated (non-edit mode) */}
          {!isEditing && atom.prompt && (atom.content_type === 'image' || atom.content_type === 'video' || atom.content_type === 'movie') && (
            <div className="mb-4">
              <h3 className={`text-sm font-medium ${text.primary} mb-2`}>Prompt</h3>
              <p className={`text-sm ${text.secondary} leading-relaxed ${backgrounds.layer2} p-3 ${radius.md} ${borders.tertiary}`}>
                {atom.prompt}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`w-full lg:w-80 p-4 ${backgrounds.layer4} border-t lg:border-t-0 lg:border-l ${borders.quaternary}`}>
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


          {/* Parent Ideas - Only for non-idea atoms */}
          {atom?.content_type !== 'idea' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${text.primary}`}>
                  Ideas
                  {isLoadingParentIdeas && <span className="text-xs text-white/50">(loading...)</span>}
                </h3>
                <IconButton
                  onClick={() => {
                    setIsEditingParentIdeas(!isEditingParentIdeas);
                    if (!isEditingParentIdeas) {
                      setParentIdeaSearch('');
                    }
                  }}
                  size="sm"
                  title={isEditingParentIdeas ? "Close edit mode" : "Edit ideas"}
                >
                  {isEditingParentIdeas ? (
                    <XIcon className={`w-3 h-3 ${icons.primary}`} />
                  ) : (
                    <PencilIcon className={`w-3 h-3 ${icons.primary}`} />
                  )}
                </IconButton>
              </div>

              {isEditingParentIdeas ? (
                <div className="space-y-3">
                  {/* Add parent idea search */}
                  <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <label className={`text-xs font-medium ${text.secondary} block`}>
                      Add to Idea
                    </label>
                    <Input
                      value={parentIdeaSearch}
                      onChange={(e) => setParentIdeaSearch(e.target.value)}
                      placeholder="Type to search for ideas..."
                      color="glass"
                      inputSize="sm"
                      autoFocus
                      className="rounded-2xl"
                    />
                    {availableIdeasForParents.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                        <div className={`text-xs ${text.tertiary} mb-1`}>
                          Click an idea to add this atom to it:
                        </div>
                        {availableIdeasForParents.slice(0, 10).map((idea) => (
                          <div
                            key={idea.id}
                            className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer border border-transparent hover:border-white/20 transition-all"
                            onClick={() => handleAddParentIdea(idea.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium ${text.primary} truncate`}>
                                {idea.title}
                              </div>
                            </div>
                            <PlusIcon className={`w-3 h-3 ${icons.secondary} ml-2 flex-shrink-0`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-xs ${text.tertiary} text-center py-2`}>
                        {parentIdeaSearch ? (
                          <div>No ideas found matching "{parentIdeaSearch}"</div>
                        ) : (
                          <div>Start typing to search for ideas...</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Display current parent ideas with remove option */}
                  {parentIdeas.length > 0 && (
                    <div className="space-y-2">
                      <div className={`text-xs ${text.tertiary} mb-1`}>
                        This atom is part of {parentIdeas.length} idea{parentIdeas.length !== 1 ? 's' : ''}:
                      </div>
                      {parentIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              if (onOpenAtom) {
                                onOpenAtom(idea);
                              } else {
                                onClose();
                                navigate(`/detail/${idea.id}`);
                              }
                            }}
                          >
                            <div className={`text-xs font-medium ${text.primary} truncate`}>
                              {idea.title}
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleRemoveParentIdea(idea.id)}
                            size="sm"
                            className="ml-2"
                            title="Remove from this idea"
                          >
                            <MinusIcon className={`w-3 h-3 ${icons.secondary}`} />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {isLoadingParentIdeas ? (
                    <div className={`text-xs ${text.tertiary} text-center py-2`}>Loading...</div>
                  ) : parentIdeas.length > 0 ? (
                    <div className="space-y-2">
                      {parentIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            if (onOpenAtom) {
                              onOpenAtom(idea);
                            } else {
                              onClose();
                              navigate(`/detail/${idea.id}`);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${text.primary} truncate`}>
                              {idea.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-xs ${text.tertiary} text-center py-2`}>
                      Not part of any idea
                    </div>
                  )}
                </div>
              )}
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
              <div className="flex flex-wrap gap-2 md:gap-3">
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