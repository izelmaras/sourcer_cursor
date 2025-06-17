import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentBadge } from "../../components/ui/content-badge";
import { DownloadIcon, LinkIcon, XIcon, TrashIcon, ZoomInIcon, PencilIcon, MinusIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Database } from '../../types/supabase';
import { Modal } from "../../components/ui/modal";
import { useAtomStore } from "../../store/atoms";
import { IconButton } from "../../components/ui/icon-button";
import { DeleteConfirmationModal } from "../../components/ui/delete-confirmation-modal";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Typography } from "../../components/ui/typography";
import { TagList } from "../../components/ui/tag-list";
import { CreatorInfo } from "../../components/ui/creator-info";
import { colors } from "../../lib/design-tokens";
import { ModalWrapper } from "../../components/ui/modal-wrapper";
import { HtmlContent } from "../../components/ui/html-content";
import { VideoPlayer } from "../../components/ui/video-player";
import { Switch } from "../../components/ui/switch";
import { supabase } from '../../lib/supabase';
import { LiveLinkPreview } from "../../components/ui/LiveLinkPreview";
import { IframeWithFallback } from "../../components/ui/IframeWithFallback";

type Atom = Database['public']['Tables']['atoms']['Row'];

interface DetailProps {
  atom?: Atom;
  open: boolean;
  onClose: () => void;
  filteredAtoms: Atom[];
}

const ZOOM_SETTINGS = {
  MIN_SCALE: 1,
  MAX_SCALE: 3,
  SCALE_STEP: 0.2,
};

export const DetailView = ({ atom, open, onClose, filteredAtoms }: DetailProps): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { atoms: allAtoms, deleteAtom, updateAtom, addTag, addCreator, fetchTags, fetchCreators, tags, creators, toggleTag } = useAtomStore();
  
  const currentAtom = atom || allAtoms.find(a => a.id === Number(id));
  const currentIndex = filteredAtoms.findIndex(a => a.id === currentAtom?.id);

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

  const [atomCreators, setAtomCreators] = useState<{ id: number, name: string }[]>([]);

  const [newCreator, setNewCreator] = useState('');

  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|webm|ogg)$/i.test(url);
  };

  useEffect(() => {
    fetchTags();
    fetchCreators();
  }, [fetchTags, fetchCreators]);

  useEffect(() => {
    if (currentAtom) {
      setEditTitle(currentAtom.title);
      setEditDescription(currentAtom.description || '');
      setEditCreators(currentAtom.creator_name ? currentAtom.creator_name.split(',').map(s => s.trim()).filter(Boolean) : []);
      setEditTags(currentAtom.tags || []);
      setIsFlagged(currentAtom.flag_for_deletion || false);
    }
  }, [currentAtom]);

  useEffect(() => {
    if (isZoomed) {
      setScale(ZOOM_SETTINGS.MIN_SCALE);
      setPosition({ x: 0, y: 0 });
    }
  }, [isZoomed]);

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
      ? (currentIndex - 1 + filteredAtoms.length) % filteredAtoms.length
      : (currentIndex + 1) % filteredAtoms.length;
    
    const newAtom = filteredAtoms[newIndex];
    navigate(`/detail/${newAtom.id}`, { replace: true });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleNavigate('prev');
    } else if (e.key === 'ArrowRight') {
      handleNavigate('next');
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredAtoms]);

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
      await deleteAtom(currentAtom.id);
      setIsDeleteModalOpen(false);
      handleClose();
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
    }
    setTagSearch("");
  };

  const handleCreateTag = () => {
    if (tagSearch && !tags.find(t => t.name === tagSearch)) {
      setEditTags([...editTags, tagSearch]);
      setTagSearch("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const handleTagSelect = (tag: string) => {
    handleClose();
    toggleTag(tag);
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

  const handleCreatorSelect = (creatorName: string) => {
    useAtomStore.getState().setSelectedCreator(creatorName);
    useAtomStore.getState().setTagDrawerCollapsed(false);
    handleClose();
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

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose}>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl mx-auto px-4 sm:px-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white w-full rounded-[32px] shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  <ContentBadge type={currentAtom.content_type} />
                  {!isEditing && currentAtom.title !== ' ' && (
                    <Typography variant="h2">{currentAtom.title}</Typography>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end items-center">
                  {hasMedia && !isVideo && (
                    <IconButton onClick={() => setIsZoomed(true)} tabIndex={-1} color="light">
                      <ZoomInIcon className="h-5 w-5" />
                    </IconButton>
                  )}
                  {currentAtom.media_source_link && (
                    <IconButton onClick={handleDownload} disabled={isDownloading} color="light">
                      <DownloadIcon className="h-5 w-5" />
                    </IconButton>
                  )}
                  {currentAtom.link && (
                    <IconButton onClick={handleExternalLink} color="light">
                      <LinkIcon className="h-5 w-5" />
                    </IconButton>
                  )}
                  <IconButton onClick={() => setIsEditing(!isEditing)} color="light">
                    <PencilIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton onClick={() => setIsDeleteModalOpen(true)} color="light">
                    <TrashIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton onClick={handleClose} color="light">
                    <XIcon className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
                {hasMedia && (
                  <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
                    {isVideo ? (
                      <VideoPlayer
                        src={currentAtom.media_source_link || ''}
                        className="max-h-[60vh] w-auto"
                        controls={true}
                        autoPlay={false}
                      />
                    ) : (
                      <img
                        src={currentAtom.media_source_link || ''}
                        alt={currentAtom.title || ''}
                        className={`max-h-[60vh] w-auto object-contain transition-opacity duration-300 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                      />
                    )}
                  </div>
                )}

                <div className="p-4 sm:p-6 space-y-6">
                  {!isEditing ? (
                    <>
                      {currentAtom.description && (
                        <HtmlContent 
                          html={currentAtom.description}
                          className="text-gray-600"
                        />
                      )}
                      {/* Add live link preview for link content */}
                      {currentAtom.content_type === 'link' && (
                        <div className="mb-6 flex justify-center">
                          <IframeWithFallback url={currentAtom.link || ""} height={520}>
                            <LiveLinkPreview url={currentAtom.link || ""} height={520}>
                              <span style={{display:'none'}} />
                            </LiveLinkPreview>
                          </IframeWithFallback>
                        </div>
                      )}
                      <TagList tags={currentAtom.tags || []} onTagClick={handleTagSelect} />
                      {atomCreators.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
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
                      ) : (
                        currentAtom.creator_name && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentAtom.creator_name.split(',').map((name, idx) => {
                              const trimmed = name.trim();
                              return trimmed ? (
                                <Button
                                  key={trimmed + idx}
                                  size="sm"
                                  selected={false}
                                  onClick={() => handleCreatorSelect(trimmed)}
                                >
                                  {trimmed}
                                </Button>
                              ) : null;
                            })}
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        color="light"
                        inputSize="lg"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        color="light"
                        inputSize="lg"
                      />
                      <Input
                        value={newCreator}
                        onChange={(e) => setNewCreator(e.target.value)}
                        placeholder="Add creator"
                        color="light"
                        inputSize="lg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCreator.trim()) {
                            if (!editCreators.includes(newCreator.trim())) {
                              setEditCreators([...editCreators, newCreator.trim()]);
                            }
                            setNewCreator('');
                            e.preventDefault();
                          }
                        }}
                        list="creators"
                      />
                      <datalist id="creators">
                        {creators.map((creator) => (
                          <option key={creator.id} value={creator.name} />
                        ))}
                      </datalist>
                      {editCreators.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editCreators.map((name, idx) => (
                            <Button
                              key={name + idx}
                              size="sm"
                              rightIcon={<XIcon className="h-4 w-4 ml-2" />}
                              onClick={() => setEditCreators(editCreators.filter((n) => n !== name))}
                              tabIndex={-1}
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4">
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
                          inputSize="lg"
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          onClick={() => setIsEditing(false)}
                          className={colors.button.secondary}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveEdits}
                          className={colors.button.primary}
                          disabled={isSaving || !editTitle}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 flex items-center justify-between p-4 bg-white border-t rounded-b-[32px]">
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
              </ScrollArea>
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