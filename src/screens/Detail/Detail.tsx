import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XIcon, TrashIcon, ZoomInIcon, PencilIcon, MinusIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, BookIcon, FileTextIcon, ImageIcon, LinkIcon, ListIcon, MusicIcon, PlayCircleIcon, UtensilsIcon, VideoIcon, NewspaperIcon, BookAudioIcon as AudioIcon, HeartIcon, LightbulbIcon, FilmIcon, FolderIcon, DownloadIcon, Tag as TagIcon } from "lucide-react";
import { Database } from '../../types/supabase';
import { useAtomStore } from "../../store/atoms";
import { IconButton } from "../../components/ui/icon-button";
import { DeleteConfirmationModal } from "../../components/ui/delete-confirmation-modal";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { HtmlContent } from "../../components/ui/html-content";
import { Switch } from "../../components/ui/switch";
import { LiveLinkPreview } from "../../components/ui/LiveLinkPreview";
import { IframeWithFallback } from "../../components/ui/IframeWithFallback";
import { supabase } from '../../lib/supabase';
import { VideoPlayer } from "../../components/ui/video-player";
import { uploadMedia } from '../../lib/storage';
import { isVideoUrl } from '../../lib/utils';
import { performanceMonitor } from '../../lib/performance-monitor';

type Atom = Database['public']['Tables']['atoms']['Row'];

interface DetailProps {
  atom?: Atom;
  open: boolean;
  onClose: () => void;
  filteredAtoms: Atom[];
  searchTerm?: string;
  selectedContentTypes?: string[];
  selectedCreator?: string | null;
}

const ZOOM_SETTINGS = {
  MIN_SCALE: 1,
  MAX_SCALE: 3,
  SCALE_STEP: 0.2,
};

export const DetailView = ({ atom, open, onClose, filteredAtoms, searchTerm, selectedContentTypes, selectedCreator }: DetailProps): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { atoms: allAtoms, deleteAtom, updateAtom, addTag, addCreator, fetchTags, fetchCreators, tags, creators, toggleTag, addAtom, fetchAtoms, selectedTags, categories, getCategoryTags, defaultCategoryId } = useAtomStore();
  
  const currentAtom = atom || allAtoms.find(a => a.id === Number(id));
  
  // Force re-render when URL changes
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Debug logging
  console.log('DetailView render:', { id, currentAtomId: currentAtom?.id, forceUpdate });
  
  // Create filtered atoms list using the same logic as GallerySection - OPTIMIZED WITH useMemo
  const actualFilteredAtoms = useMemo(() => {
    const stopTimer = performanceMonitor.startTimer('DetailView Filtering');
    
    const result = allAtoms.filter(atom => {
      const matchesSearch = !searchTerm || searchTerm.toLowerCase() === '' || 
        atom.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atom.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (atom.tags && atom.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = !selectedContentTypes || selectedContentTypes.length === 0 || selectedContentTypes.includes(atom.content_type);
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
    
    stopTimer();
    return result;
  }, [allAtoms, searchTerm, selectedContentTypes, selectedCreator, categories, selectedTags, defaultCategoryId]);
  
  const currentIndex = useMemo(() => 
    actualFilteredAtoms.findIndex(a => a.id === currentAtom?.id),
    [actualFilteredAtoms, currentAtom?.id]
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(ZOOM_SETTINGS.MIN_SCALE);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlagged, setIsFlagged] = useState(currentAtom?.flag_for_deletion || false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentAtom?.title || '');
  const [editDescription, setEditDescription] = useState(currentAtom?.description || '');
  const [editCreators, setEditCreators] = useState<string[]>(currentAtom?.creator_name ? currentAtom.creator_name.split(',').map(s => s.trim()).filter(Boolean) : []);
  const [editTags, setEditTags] = useState<string[]>(currentAtom?.tags || []);
  const [tagSearch, setTagSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editSourceUrl, setEditSourceUrl] = useState(currentAtom?.media_source_link || '');
  const [editExternalLink, setEditExternalLink] = useState(currentAtom?.link || '');

  const [atomCreators, setAtomCreators] = useState<{ id: number, name: string }[]>([]);

  const [newCreator, setNewCreator] = useState('');

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  // Add a new state for uploading the main image
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isEditTypeSelectorOpen, setIsEditTypeSelectorOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isEditingSourceLink, setIsEditingSourceLink] = useState(false);
  const [isEditingExternalLink, setIsEditingExternalLink] = useState(false);

  // Use the utility function from lib/utils

  useEffect(() => {
    fetchTags();
    fetchCreators();
  }, [fetchTags, fetchCreators]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const typeDropdown = document.querySelector('[data-type-dropdown]');
      const typeButton = document.querySelector('[data-type-button]');
      const editTypeDropdown = document.querySelector('[data-edit-type-dropdown]');
      const editTypeButton = document.querySelector('[data-edit-type-button]');
      
      if (isTypeSelectorOpen && 
          typeDropdown && 
          !typeDropdown.contains(target) && 
          typeButton && 
          !typeButton.contains(target)) {
        setIsTypeSelectorOpen(false);
      }
      if (isEditTypeSelectorOpen && 
          editTypeDropdown && 
          !editTypeDropdown.contains(target) && 
          editTypeButton && 
          !editTypeButton.contains(target)) {
        setIsEditTypeSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeSelectorOpen, isEditTypeSelectorOpen]);

  useEffect(() => {
    if (currentAtom) {
      setEditTitle(currentAtom.title);
      setEditDescription(currentAtom.description || '');
      setEditCreators(currentAtom.creator_name ? currentAtom.creator_name.split(',').map(s => s.trim()).filter(Boolean) : []);
      setEditTags(currentAtom.tags || []);
      setIsFlagged(currentAtom.flag_for_deletion || false);
      setEditSourceUrl(currentAtom.media_source_link || '');
      setEditExternalLink(currentAtom.link || '');
      setEditType(currentAtom.content_type || 'image');
    }
  }, [currentAtom, forceUpdate]);

  useEffect(() => {
    if (isZoomed) {
      setScale(ZOOM_SETTINGS.MIN_SCALE);
      setPosition({ x: 0, y: 0 });
    }
  }, [isZoomed]);

  // Listen for URL parameter changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [id]);

  useEffect(() => {
    async function fetchAtomCreators() {
      if (!currentAtom?.id) return;
      const { data, error } = await supabase
        .from('atom_creators')
        .select('creator_id, creators(name, id)')
        .eq('atom_id', currentAtom.id);
      if (data) {
        setAtomCreators(data.map((row: any) => ({ id: row.creators.id, name: row.creators.name })));
      } else {
        setAtomCreators([]);
      }
    }
    fetchAtomCreators();
  }, [currentAtom?.id]);

  const handleClose = () => {
    navigate('/', { replace: true });
    onClose();
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + actualFilteredAtoms.length) % actualFilteredAtoms.length
      : (currentIndex + 1) % actualFilteredAtoms.length;
    
    const newAtom = actualFilteredAtoms[newIndex];
    console.log(`Navigating ${direction}: currentIndex=${currentIndex}, newIndex=${newIndex}, newAtomId=${newAtom.id}`);
    navigate(`/detail/${newAtom.id}`);
    
    // Force re-render after navigation
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 100);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleNavigate('prev');
    } else if (e.key === 'ArrowRight') {
      handleNavigate('next');
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }, [currentIndex, actualFilteredAtoms]);

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

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_SETTINGS.SCALE_STEP : ZOOM_SETTINGS.SCALE_STEP;
      const newScale = Math.max(
        ZOOM_SETTINGS.MIN_SCALE,
        Math.min(scale + delta, ZOOM_SETTINGS.MAX_SCALE)
      );
      setScale(newScale);
    }
  };

  const handleDownload = async () => {
    if (!currentAtom?.media_source_link || isDownloading) return;

    try {
      setIsDownloading(true);
      const urlParts = currentAtom.media_source_link.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0] || 'download';
      const link = document.createElement('a');
      link.href = currentAtom.media_source_link;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (currentAtom) {
      try {
        await deleteAtom(currentAtom.id);
        setIsDeleteModalOpen(false);
        
        // Refresh the atoms data to get the updated list
        await fetchAtoms();
        
        // Check if there are more items in the filtered list
        const remainingAtoms = actualFilteredAtoms.filter(atom => atom.id !== currentAtom.id);
        
        if (remainingAtoms.length > 0) {
          // Navigate to the next item in the list
          const nextIndex = Math.min(currentIndex, remainingAtoms.length - 1);
          const nextAtom = remainingAtoms[nextIndex];
          navigate(`/detail/${nextAtom.id}`, { replace: true });
        } else {
          // No more items, go back to the feed
          navigate('/', { replace: true });
        }
        
        onClose();
      } catch (error) {
        console.error('Error deleting atom:', error);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleExternalLink = () => {
    if (currentAtom?.link) {
      window.open(currentAtom.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEdits = async () => {
    if (!editTitle || !currentAtom) return;
    try {
      setIsSaving(true);
      // Ensure each creator exists individually
      for (const creatorName of editCreators) {
        if (!creators.find(c => c.name === creatorName)) {
          await addCreator({ name: creatorName, count: 1 });
        }
      }
      for (const tag of editTags) {
        if (!tags.find(t => t.name === tag)) {
          await addTag({ name: tag, count: 1 });
        }
      }
      await updateAtom(currentAtom.id, {
        title: editTitle,
        description: editDescription || null,
        creator_name: editCreators.join(', '), // legacy, join table is updated in store
        tags: editTags,
        media_source_link: editSourceUrl,
        link: editExternalLink,
        content_type: editType,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving edits:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagClick = (tagName: string) => {
    if (!editTags.includes(tagName)) {
      setEditTags([...editTags, tagName]);
      setTagSearch(""); // Only clear after adding
    }
  };

  const handleCreateTag = () => {
    if (tagSearch && !tags.find(t => t.name === tagSearch)) {
      setEditTags([...editTags, tagSearch]);
      setTagSearch(""); // Only clear after adding
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const handleTagSelect = (tag: string) => {
    handleClose();
    toggleTag(tag);
    useAtomStore.getState().setTagDrawerCollapsed(false);
  };

  const handleToggleFlag = async () => {
    if (!currentAtom) return;

    try {
      const newFlagState = !isFlagged;
      setIsFlagged(newFlagState);
      await updateAtom(currentAtom.id, {
        flag_for_deletion: newFlagState
      });
    } catch (error) {
      setIsFlagged(!isFlagged);
      console.error('Error toggling flag:', error);
    }
  };

  const handleTypeChange = async (newType: string) => {
    if (!currentAtom) return;

    try {
      // Update local state immediately for better UX
      setEditType(newType);
      setIsTypeSelectorOpen(false);
      
      // Update the database
      await updateAtom(currentAtom.id, {
        content_type: newType
      });
      
      // Refresh the atom data
      await fetchAtoms();
    } catch (error) {
      console.error('Error changing content type:', error);
      // Revert local state on error
      setEditType(currentAtom.content_type || 'image');
    }
  };

  const handleCreatorSelect = (creatorName: string) => {
    useAtomStore.getState().setSelectedCreator(creatorName);
    useAtomStore.getState().setTagDrawerCollapsed(false);
    handleClose();
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
      // Optionally show error to user
      setMediaPreview(null);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // New handler for main image upload (for both main image and thumbnail)
  const handleMainImageDrop = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return; // Only allow images
    setIsUploadingMainImage(true);
    try {
      const url = await uploadMedia(file);
      // Update both media_source_link and thumbnail_path
      setEditSourceUrl(url);
      setImageLoaded(false);
      if (currentAtom) {
        currentAtom.media_source_link = url;
        currentAtom.thumbnail_path = url;
        await updateAtom(currentAtom.id, {
          media_source_link: url,
          thumbnail_path: url,
        });
      }
      await fetchAtoms();
    } catch (error) {
      // Optionally show error to user
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  // Duplicate function
  const handleDuplicate = async () => {
    if (!currentAtom) return;
    // Prepare new atom data, omitting id, created_at, updated_at
    const {
      id, created_at, updated_at, ...rest
    } = currentAtom;
    // Insert as new atom
    await addAtom({
      ...rest,
      title: rest.title ? rest.title + ' (Copy)' : 'Untitled (Copy)',
      store_in_database: true,
    });
    // Refetch atoms to get the new ID
    await fetchAtoms();
    // Find the most recent atom with the same title (should be the duplicate)
    const newAtom = getMostRecentDuplicate(rest.title ? rest.title + ' (Copy)' : 'Untitled (Copy)');
    if (newAtom) {
      onClose(); // Close the current detail modal
      setTimeout(() => {
        navigate(`/detail/${newAtom.id}`);
      }, 0);
    }
  };

  // Helper to find the most recent duplicate by title
  const getMostRecentDuplicate = (title: string) => {
    const matches = allAtoms.filter(a => a.title === title);
    if (matches.length === 0) return null;
    // Return the one with the latest created_at
    return matches.reduce((latest, atom) => {
      if (!latest.created_at || (atom.created_at && atom.created_at > latest.created_at)) {
        return atom;
      }
      return latest;
    }, matches[0]);
  };

  if (!currentAtom) return <span />;

  const hasMedia = currentAtom.media_source_link && (currentAtom.content_type === 'image' || currentAtom.content_type === 'video');
  const isVideo = hasMedia && isVideoUrl(currentAtom.media_source_link || '');

  const filteredTags = tags
    .filter(tag => 
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !editTags.includes(tag.name)
    )
    .slice(0, 12);

  const showCreateTag = tagSearch && 
    !tags.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) &&
    !editTags.includes(tagSearch);

  // Debug output for image rendering - REMOVED FOR PERFORMANCE
  // console.log('DetailView debug:', {
  //   media_source_link: currentAtom.media_source_link,
  //   content_type: currentAtom.content_type,
  //   imageLoaded,
  //   hasMedia,
  //   isVideo
  // });

  // Content types for type switcher
  const contentTypes = [
    { icon: <NewspaperIcon className="h-4 w-4 text-white" />, label: "Article/blog", type: "article" },
    { icon: <AudioIcon className="h-4 w-4 text-white" />, label: "Audio", type: "audio" },
    { icon: <BookIcon className="h-4 w-4 text-white" />, label: "Book", type: "book" },
    { icon: <HeartIcon className="h-4 w-4 text-white" />, label: "Feeling", type: "feeling" },
    { icon: <LightbulbIcon className="h-4 w-4 text-white" />, label: "Idea", type: "idea" },
    { icon: <ImageIcon className="h-4 w-4 text-white" />, label: "Image", type: "image" },
    { icon: <FileTextIcon className="h-4 w-4 text-white" />, label: "Life event", type: "life-event" },
    { icon: <LinkIcon className="h-4 w-4 text-white" />, label: "Link", type: "link" },
    { icon: <FileTextIcon className="h-4 w-4 text-white" />, label: "Memory", type: "memory" },
    { icon: <FilmIcon className="h-4 w-4 text-white" />, label: "Movie", type: "movie" },
    { icon: <FileTextIcon className="h-4 w-4 text-white" />, label: "Note", type: "note" },
    { icon: <FileTextIcon className="h-4 w-4 text-white" />, label: "PDF", type: "pdf" },
    { icon: <PlayCircleIcon className="h-4 w-4 text-white" />, label: "Podcast", type: "podcast" },
    { icon: <FolderIcon className="h-4 w-4 text-white" />, label: "Project", type: "project" },
    { icon: <UtensilsIcon className="h-4 w-4 text-white" />, label: "Recipe", type: "recipe" },
    { icon: <MusicIcon className="h-4 w-4 text-white" />, label: "Spotify", type: "spotify" },
    { icon: <MusicIcon className="h-4 w-4 text-white" />, label: "Playlist", type: "playlist" },
    { icon: <ListIcon className="h-4 w-4 text-white" />, label: "Task", type: "task" },
    { icon: <VideoIcon className="h-4 w-4 text-white" />, label: "Video", type: "video" },
    { icon: <LinkIcon className="h-4 w-4 text-white" />, label: "Website", type: "website" },
    { icon: <PlayCircleIcon className="h-4 w-4 text-white" />, label: "YouTube", type: "youtube" },
  ];
  const [editType, setEditType] = useState(currentAtom?.content_type || "image");

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose}>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl mx-auto px-4 sm:px-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white w-full rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header with action buttons */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  {/* Clean header - no redundant text */}
                </div>
                <div className="flex flex-wrap gap-2 justify-end items-center">
                  {hasMedia && !isVideo && (
                    <IconButton onClick={() => setIsZoomed(true)} tabIndex={-1} color="light">
                      <ZoomInIcon className="h-5 w-5" />
                    </IconButton>
                  )}
                  {currentAtom?.media_source_link && (
                    <IconButton onClick={handleDownload} disabled={isDownloading} color="light">
                      <DownloadIcon className="h-5 w-5" />
                    </IconButton>
                  )}
                  {currentAtom?.link && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <IconButton onClick={handleExternalLink} color="light" className="bg-blue-100 hover:bg-blue-200">
                        <LinkIcon className="h-4 w-4 text-blue-600" />
                      </IconButton>
                      <span className="text-sm text-blue-700 font-medium">External Link</span>
                    </div>
                  )}
                  <IconButton onClick={handleDuplicate} color="light">
                    <PlusIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton onClick={() => setIsDeleteModalOpen(true)} color="light">
                    <TrashIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton onClick={handleClose} color="light">
                    <XIcon className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="flex-1 flex">
                {/* Left column - Media */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-0">
                  {hasMedia ? (
                    isVideo ? (
                      <VideoPlayer
                        src={currentAtom?.media_source_link || ''}
                        className="max-h-full w-auto object-contain"
                        controls={true}
                        autoPlay={false}
                        muted={false}
                      />
                    ) : (
                      <img
                        src={currentAtom?.media_source_link || '/placeholder-image.png'}
                        alt={currentAtom?.title || 'Image not available'}
                        className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={e => { e.currentTarget.src = '/placeholder-image.png'; }}
                      />
                    )
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <p>No media content</p>
                    </div>
                  )}
                </div>

                {/* Right column - Content */}
                <div className="w-96 border-l bg-white overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Type selector */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <div className="relative">
                        <button
                          data-type-button
                          onClick={() => setIsTypeSelectorOpen(!isTypeSelectorOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm transition-all duration-200"
                        >
                          <span>{contentTypes.find(ct => ct.type === editType)?.label || 'Select Type'}</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        {isTypeSelectorOpen && (
                          <div data-type-dropdown className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                            <div className="p-2 max-h-64 overflow-y-auto">
                              {contentTypes.map(ct => (
                                <button
                                  key={ct.type}
                                  onClick={() => handleTypeChange(ct.type)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    editType === ct.type
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {React.cloneElement(ct.icon, { className: 'h-4 w-4' })}
                                  <span className="text-sm">{ct.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <IconButton 
                          onClick={() => setIsEditingTitle(!isEditingTitle)} 
                          color="light"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                      {isEditingTitle ? (
                        <div className="space-y-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Enter title..."
                            color="light"
                            inputSize="sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleSaveEdits();
                                setIsEditingTitle(false);
                              }}
                              size="sm"
                              disabled={isSaving || !editTitle}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditTitle(currentAtom?.title || '');
                                setIsEditingTitle(false);
                              }}
                              size="sm"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900 min-h-[2.5rem] flex items-center">
                          {currentAtom?.title || 'No title'}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <IconButton 
                          onClick={() => setIsEditingDescription(!isEditingDescription)} 
                          color="light"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                      {isEditingDescription ? (
                        <div className="space-y-2">
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Enter description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleSaveEdits();
                                setIsEditingDescription(false);
                              }}
                              size="sm"
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditDescription(currentAtom?.description || '');
                                setIsEditingDescription(false);
                              }}
                              size="sm"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600 min-h-[4rem]">
                          {currentAtom?.description ? (
                            <HtmlContent html={currentAtom.description} />
                          ) : (
                            'No description'
                          )}
                        </div>
                      )}
                    </div>

                    {/* Source Link */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Source Link</label>
                        <IconButton 
                          onClick={() => setIsEditingSourceLink(!isEditingSourceLink)} 
                          color="light"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                      {isEditingSourceLink ? (
                        <div className="space-y-2">
                          <Input
                            value={editSourceUrl}
                            onChange={(e) => setEditSourceUrl(e.target.value)}
                            placeholder="Enter source URL..."
                            color="light"
                            inputSize="sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleSaveEdits();
                                setIsEditingSourceLink(false);
                              }}
                              size="sm"
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditSourceUrl(currentAtom?.media_source_link || '');
                                setIsEditingSourceLink(false);
                              }}
                              size="sm"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600 min-h-[2.5rem] flex items-center">
                          {currentAtom?.media_source_link || 'No source link'}
                        </div>
                      )}
                    </div>

                    {/* External Link */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">External Link</label>
                        <IconButton 
                          onClick={() => setIsEditingExternalLink(!isEditingExternalLink)} 
                          color="light"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                      {isEditingExternalLink ? (
                        <div className="space-y-2">
                          <Input
                            value={editExternalLink}
                            onChange={(e) => setEditExternalLink(e.target.value)}
                            placeholder="Enter external URL..."
                            color="light"
                            inputSize="sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleSaveEdits();
                                setIsEditingExternalLink(false);
                              }}
                              size="sm"
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditExternalLink(currentAtom?.link || '');
                                setIsEditingExternalLink(false);
                              }}
                              size="sm"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600 min-h-[2.5rem] flex items-center">
                          {currentAtom?.link || 'No external link'}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        <IconButton 
                          onClick={() => setIsEditingTags(!isEditingTags)} 
                          color="light"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                      {isEditingTags ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Add tag"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredTags.length > 0) {
                                  handleTagClick(filteredTags[0].name);
                                } else if (showCreateTag) {
                                  handleCreateTag();
                                }
                              }
                            }}
                            color="light"
                            inputSize="sm"
                          />
                          {editTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {editTags.map((tag) => (
                                <Button
                                  key={tag}
                                  size="sm"
                                  rightIcon={<XIcon className="h-4 w-4 ml-2" />}
                                  onClick={() => handleRemoveTag(tag)}
                                  tabIndex={-1}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>
                          )}
                          {(tagSearch || showCreateTag) && (
                            <div className="grid grid-cols-2 gap-2">
                              {filteredTags.map((tag) => (
                                <Button
                                  key={tag.id}
                                  size="sm"
                                  selected={false}
                                  onClick={() => handleTagClick(tag.name)}
                                >
                                  {tag.name}
                                </Button>
                              ))}
                              {showCreateTag && (
                                <Button
                                  size="sm"
                                  selected={false}
                                  onClick={handleCreateTag}
                                >
                                  {`Create "${tagSearch}"`}
                                </Button>
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleSaveEdits();
                                setIsEditingTags(false);
                              }}
                              size="sm"
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditTags(currentAtom?.tags || []);
                                setIsEditingTags(false);
                              }}
                              size="sm"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-center">
                          {currentAtom?.tags && currentAtom.tags.length > 0 ? (
                            currentAtom.tags.map((tag) => (
                              <Button
                                key={tag}
                                size="sm"
                                leftIcon={<TagIcon className="h-4 w-4" />}
                                rightIcon={<XIcon className="h-4 w-4" />}
                                onClick={() => handleTagSelect(tag)}
                              >
                                {tag}
                              </Button>
                            ))
                          ) : (
                            <span className="text-gray-400">No tags</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Creators */}
                    {atomCreators.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Creators</label>
                        <div className="flex flex-wrap gap-2">
                          {atomCreators.map((creator) => (
                            <Button
                              key={creator.id}
                              size="sm"
                              selected={false}
                              onClick={() => handleCreatorSelect(creator.name)}
                            >
                              {creator.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Link preview for link content */}
                    {currentAtom?.content_type === 'link' && currentAtom?.link && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Link Preview</label>
                        <div className="border rounded-lg overflow-hidden">
                          <IframeWithFallback url={currentAtom.link} height={300}>
                            <LiveLinkPreview url={currentAtom.link} height={300}>
                              <span style={{display:'none'}} />
                            </LiveLinkPreview>
                          </IframeWithFallback>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom navigation and flag */}
              <div className="sticky bottom-0 flex items-center justify-between p-4 bg-white border-t rounded-b-xl">
                <div className="flex items-center gap-4">
                  <IconButton
                    onClick={() => handleNavigate('prev')}
                    className="hover:bg-gray-100 transition-colors"
                    color="light"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleNavigate('next')}
                    className="hover:bg-gray-100 transition-colors"
                    color="light"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </IconButton>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Flag for review</span>
                  <Switch
                    checked={isFlagged}
                    onCheckedChange={handleToggleFlag}
                    className={isFlagged ? 'bg-red-500' : ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isZoomed && !isVideo && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <IconButton onClick={handleZoomOut} disabled={scale <= ZOOM_SETTINGS.MIN_SCALE} className="bg-gray-100" color="light">
              <MinusIcon className="h-6 w-6 text-black" />
            </IconButton>
            <IconButton onClick={handleZoomIn} disabled={scale >= ZOOM_SETTINGS.MAX_SCALE} className="bg-gray-100" color="light">
              <PlusIcon className="h-6 w-6 text-black" />
            </IconButton>
            <IconButton onClick={() => setIsZoomed(false)} className="bg-gray-100" color="light">
              <XIcon className="h-6 w-6 text-black" />
            </IconButton>
          </div>
          <div 
            ref={containerRef}
            className="h-full flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={currentAtom.media_source_link || ''}
              alt={currentAtom.title || ''}
              className="max-h-screen max-w-full object-contain transition-transform duration-200"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />
    </>
  );
};