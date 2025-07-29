import React, { useState, useEffect } from 'react';

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAtomStore } from "../../store/atoms";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalHeader, ModalBody } from "../../components/ui/modal";
import { SearchBar } from "../../components/ui/search-bar";
import { ModalWrapper } from "../../components/ui/modal-wrapper";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PencilIcon, ArrowUpIcon, TrashIcon, PlusIcon, LockIcon, UnlockIcon, XIcon, LinkIcon, StarIcon } from "lucide-react";
import type { Database } from '../../types/supabase';

interface OrganizeProps {
  open: boolean;
  onClose: () => void;
  initialType?: 'Categories' | 'Tags' | 'TagsByCategories' | 'Creators';
  onCreatorSelect?: (creator: string) => void;
}

// --- TYPE DEFINITIONS ---
type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type Creator = Database['public']['Tables']['creators']['Row'];

enum OrganizeType {
  Categories = 'Categories',
  Tags = 'Tags',
  TagsByCategories = 'TagsByCategories',
  Creators = 'Creators',
}

// --- TYPE GUARDS ---
function isCategory(item: any): item is Category {
  return 'description' in item;
}
function isTag(item: any): item is Tag {
  return 'category_id' in item;
}
function isCreator(item: any): item is Creator {
  return 'link_1' in item || 'link_2' in item || 'link_3' in item;
}

export const Organize = ({ open, onClose, initialType = 'Categories', onCreatorSelect }: OrganizeProps): JSX.Element => {
  const {
    categories,
    tags,
    creators,
    fetchCategories,
    fetchTags,
    fetchCreators,
    fetchCreatorTags,
    fetchCategoryTags,
    addCategory,
    addTag,
    addCreator,
    updateCategory,
    updateTag,
    updateCreator,
    deleteCategory,
    deleteTag,
    deleteCreator,
    mergeCategory,
    mergeTag,
    mergeCreator,
    assignTagToCategory,
    removeTagFromCategory,
    assignTagToCreator,
    removeTagFromCreator,
    getCategoryTags,
    getCreatorTags,
    toggleTag,
    setDefaultCategory,
    defaultCategoryId
  } = useAtomStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'Categories' | 'Tags' | 'TagsByCategories' | 'Creators'>(initialType);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLinks, setEditingLinks] = useState<{link1: string; link2: string; link3: string}>({
    link1: '',
    link2: '',
    link3: ''
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [mergeSourceId, setMergeSourceId] = useState<number | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<number | null>(null);
  const [mergeSearch, setMergeSearch] = useState('');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedTagForAssignment, setSelectedTagForAssignment] = useState<{id: number, name: string} | null>(null);
  const [assigningTag, setAssigningTag] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchTags(),
        fetchCreators(),
        fetchCreatorTags(),
        fetchCategoryTags()
      ]);
    };
    
    initializeData();
  }, [fetchCategories, fetchTags, fetchCreators, fetchCreatorTags, fetchCategoryTags]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  // Prevent page scrolling when assignment modal is open
  useEffect(() => {
    if (isAssignmentModalOpen) {
      // Disable page scrolling
      document.body.style.overflow = 'hidden';
      return () => {
        // Re-enable page scrolling when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isAssignmentModalOpen]);



  const getItems = () => {
    const items = (() => {
      switch (selectedType) {
        case 'Categories':
          return categories;
        case 'Tags':
          return tags;
        case 'TagsByCategories':
          return tags; // We'll handle this differently in the render
        case 'Creators':
          return creators;
        default:
          return [];
      }
    })();

    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  };

  const getTagsByCategories = () => {
    // Get all tags that are assigned to any category
    const categorizedTagIds = new Set();
    categories.forEach(category => {
      const categoryTags = getCategoryTags(category.id);
      categoryTags.forEach(tag => categorizedTagIds.add(tag.id));
    });
    
    // Uncategorized tags are those not assigned to any category
    const uncategorizedTags = tags.filter(tag => !categorizedTagIds.has(tag.id));
    
    // Categorized tags grouped by their categories
    const categorizedTags = categories.map(category => ({
      category,
      tags: getCategoryTags(category.id)
    })).filter(group => group.tags.length > 0);
    
    // Debug logging - REMOVED FOR PERFORMANCE
    // console.log('Total tags:', tags.length);
    // console.log('Categorized tag IDs:', Array.from(categorizedTagIds));
    // console.log('Uncategorized tags:', uncategorizedTags.map(t => t.name));
    // console.log('Categorized tags by category:', categorizedTags.map(ct => ({
    //   category: ct.category.name,
    //   tags: ct.tags.map(t => t.name)
    // })));
    
    return { uncategorizedTags, categorizedTags };
  };

  const handleAdd = async () => {
    if (!newItemName) return;

    switch (selectedType) {
      case 'Categories':
        await addCategory({ name: newItemName, description: newItemDescription });
        break;
      case 'Tags':
        await addTag({ name: newItemName, count: 0 });
        break;
      case 'Creators':
        await addCreator({ name: newItemName, count: 0 });
        break;
    }

    setNewItemName('');
    setNewItemDescription('');
    setIsAddDialogOpen(false);
  };

  const handleEdit = (id: number, name: string, item?: any) => {
    setEditingId(id);
    setEditingName(name);
    if (selectedType === 'Creators' && item) {
      setEditingLinks({
        link1: item.link_1 || '',
        link2: item.link_2 || '',
        link3: item.link_3 || ''
      });
    }
  };

  const handleSave = async () => {
    if (!editingId) return;

    switch (selectedType) {
      case 'Categories':
        if (editingName) await updateCategory(editingId, editingName);
        break;
      case 'Tags':
        if (editingName) await updateTag(editingId, editingName);
        break;
      case 'Creators':
        await updateCreator(editingId, {
          ...(editingName ? { name: editingName } : {}),
          link_1: editingLinks.link1 || null,
          link_2: editingLinks.link2 || null,
          link_3: editingLinks.link3 || null
        });
        break;
    }

    setEditingId(null);
    setEditingName('');
    setEditingLinks({ link1: '', link2: '', link3: '' });
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    switch (selectedType) {
      case 'Categories':
        await deleteCategory(deleteItemId);
        break;
      case 'Tags':
        await deleteTag(deleteItemId);
        break;
      case 'Creators':
        await deleteCreator(deleteItemId);
        break;
    }

    setIsDeleteDialogOpen(false);
    setDeleteItemId(null);
  };

  const handleOpenSetTags = (itemId: number) => {
    setSelectedItemId(itemId);
    const itemTags = selectedType === 'Categories' 
      ? getCategoryTags(itemId)
      : getCreatorTags(itemId);
    setSelectedTags(itemTags.map(tag => tag.name));
    setTagSearch('');
  };

  const handleTagClick = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagSearch('');
  };

  const handleCreateTag = () => {
    if (tagSearch && !tags.find(t => t.name === tagSearch)) {
      setSelectedTags([...selectedTags, tagSearch]);
      setTagSearch('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleSaveTags = async () => {
    if (!selectedItemId) return;

    const existingTags = selectedType === 'Categories'
      ? getCategoryTags(selectedItemId)
      : getCreatorTags(selectedItemId);
    const existingTagNames = existingTags.map(tag => tag.name);

    // Add new tags to the database if they don't exist
    for (const tagName of selectedTags) {
      if (!tags.find(t => t.name === tagName)) {
        await addTag({ name: tagName, count: 1 });
      }
    }

    // Remove tags that were unselected
    for (const tag of existingTags) {
      if (!selectedTags.includes(tag.name)) {
        if (selectedType === 'Categories') {
          await removeTagFromCategory(selectedItemId, tag.id);
        } else {
          await removeTagFromCreator(selectedItemId, tag.id);
        }
      }
    }

    // Add newly selected tags
    for (const tagName of selectedTags) {
      if (!existingTagNames.includes(tagName)) {
        const tag = tags.find(t => t.name === tagName) || (await fetchTags(), tags.find(t => t.name === tagName));
        if (tag) {
          if (selectedType === 'Categories') {
            await assignTagToCategory(selectedItemId, tag.id);
          } else {
            await assignTagToCreator(selectedItemId, tag.id);
          }
        }
      }
    }

    setSelectedItemId(null);
    setSelectedTags([]);
    setTagSearch('');
  };

  const handleTogglePrivate = async (id: number, currentPrivate: boolean) => {
    switch (selectedType) {
      case 'Categories':
        await updateCategory(id, undefined, !currentPrivate);
        break;
      case 'Tags':
        await updateTag(id, undefined, !currentPrivate);
        break;
    }
  };

  const handleItemClick = (item: any) => {
    switch (selectedType) {
      case 'Categories':
        setDefaultCategory(item.id === defaultCategoryId ? null : item.id);
        break;
      case 'Tags':
        toggleTag(item.name);
        break;
      case 'Creators':
        if (onCreatorSelect) {
          onCreatorSelect(item.name);
        }
        break;
    }
    onClose();
  };

  const handleInlineMerge = async () => {
    if (!mergeSourceId || !mergeTargetId) return;
    switch (selectedType) {
      case 'Categories':
        await mergeCategory(mergeSourceId, mergeTargetId);
        break;
      case 'Tags':
        await mergeTag(mergeSourceId, mergeTargetId);
        break;
      case 'Creators':
        await mergeCreator(mergeSourceId, mergeTargetId);
        break;
    }
    setMergeSourceId(null);
    setMergeTargetId(null);
    setMergeSearch('');
  };

  const handleCancelInlineMerge = () => {
    setMergeSourceId(null);
    setMergeTargetId(null);
    setMergeSearch('');
  };

  const handleTagRightClick = (e: React.MouseEvent, tagId: number, tagName: string) => {
    e.preventDefault();
    setSelectedTagForAssignment({ id: tagId, name: tagName });
    setModalPosition({ x: e.clientX, y: e.clientY });
    setIsAssignmentModalOpen(true);
  };

  const handleAssignTag = async (categoryId: number) => {
    if (!selectedTagForAssignment) return;
    
    try {
      console.log('Assigning tag', selectedTagForAssignment.id, 'to category', categoryId);
      setAssigningTag(categoryId);
      await assignTagToCategory(categoryId, selectedTagForAssignment.id);
      console.log('Assignment successful');
      setIsAssignmentModalOpen(false);
      setSelectedTagForAssignment(null);
      setModalPosition(null);
      setAssigningTag(null);
      await Promise.all([fetchTags(), fetchCategoryTags()]);
      console.log('Data refreshed');
    } catch (error) {
      console.error('Failed to assign tag to category:', error);
      setAssigningTag(null);
    }
  };



  const filteredItems = getItems().filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags
    .filter(tag => 
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(tag.name)
    )
    .slice(0, 12);

  const showCreateTag = tagSearch && 
    !tags.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) &&
    !selectedTags.includes(tagSearch);

  const buttonStyle = "bg-white/5 backdrop-blur-sm text-white border border-white/10 shadow-sm hover:bg-white/8";
  const inputStyle = "bg-white/5 backdrop-blur-sm text-white border border-white/10 focus:ring-2 focus:ring-white/20";

  // --- ORGANIZE LIST ITEM COMPONENT ---
  interface OrganizeListItemProps {
    item: Category | Tag | Creator;
    selectedType: OrganizeType;
    isEditing: boolean;
    isDefaultCategory: boolean;
    editingName: string;
    editingLinks: { link1: string; link2: string; link3: string };
    inputStyle: string;
    buttonStyle: string;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onMerge: () => void;
    onDelete: () => void;
    onOpenSetTags: () => void;
    onTogglePrivate: () => void;
    onItemClick: () => void;
    setEditingName: (v: string) => void;
    setEditingLinks: (v: { link1: string; link2: string; link3: string }) => void;
  }
  const OrganizeListItem = ({
    item, selectedType, isEditing, isDefaultCategory, editingName, editingLinks, inputStyle, buttonStyle,
    onEdit, onSave, onCancel, onMerge, onDelete, onOpenSetTags, onTogglePrivate, onItemClick,
    setEditingName, setEditingLinks
  }: OrganizeListItemProps) => {
    if (isEditing) {
      return (
        <div className="flex-grow text-left">
          <div className="space-y-2">
            <Input 
              value={editingName} 
              onChange={e => setEditingName(e.target.value)} 
              placeholder="Name" 
              color="glass"
              inputSize="lg"
            />
            {selectedType === OrganizeType.Creators && (
              <>
                <Input 
                  value={editingLinks.link1} 
                  onChange={e => setEditingLinks({ ...editingLinks, link1: e.target.value })} 
                  placeholder="Link 1" 
                  color="glass"
                  inputSize="lg"
                />
                <Input 
                  value={editingLinks.link2} 
                  onChange={e => setEditingLinks({ ...editingLinks, link2: e.target.value })} 
                  placeholder="Link 2" 
                  color="glass"
                  inputSize="lg"
                />
                <Input 
                  value={editingLinks.link3} 
                  onChange={e => setEditingLinks({ ...editingLinks, link3: e.target.value })} 
                  placeholder="Link 3" 
                  color="glass"
                  inputSize="lg"
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={onCancel}>Cancel</Button>
              <Button size="sm" selected={true} onClick={onSave}>Save</Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-grow text-left cursor-pointer hover:text-white/80" onClick={onItemClick}>
        <div className="flex items-center gap-2">
          <span className="text-white">{item.name}</span>
          {selectedType === OrganizeType.Categories && isDefaultCategory && <StarIcon className="h-4 w-4 text-yellow-400" />}
          {((selectedType === OrganizeType.Categories || selectedType === OrganizeType.Creators) && 'count' in item && typeof item.count === 'number') && (
            <span className="text-white/60 text-sm">({item.count || 0} instances)</span>
          )}
        </div>
        {selectedType === OrganizeType.Creators && (
          <>
            <div className="flex flex-wrap gap-2 mt-1">
              {'link_1' in item && item.link_1 && (
                <a href={item.link_1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-white/70 hover:text-white"><LinkIcon className="h-3 w-3" />Link 1</a>
              )}
              {'link_2' in item && item.link_2 && (
                <a href={item.link_2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-white/70 hover:text-white"><LinkIcon className="h-3 w-3" />Link 2</a>
              )}
              {'link_3' in item && item.link_3 && (
                <a href={item.link_3} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-white/70 hover:text-white"><LinkIcon className="h-3 w-3" />Link 3</a>
              )}
            </div>
            {/* Show tags under creator links */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {getCreatorTags(item.id).map(tag => (
                <button
                  key={tag.id}
                  className="px-2 py-1 rounded bg-white/10 text-white text-xs hover:bg-white/20 transition-colors border border-white/10 max-w-32 truncate"
                  onClick={e => { e.stopPropagation(); toggleTag(tag.name); }}
                  type="button"
                  title={tag.name}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl px-2 sm:px-6 outline-none max-h-[90vh] sm:max-h-[80vh]">
                      <ScrollArea className="max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <ModalWrapper className="max-h-[90vh] sm:max-h-[80vh] h-auto flex flex-col">
              <ModalHeader className="flex-none pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      selected={selectedType === 'Categories'}
                      onClick={() => setSelectedType('Categories')}
                    >
                      Categories
                    </Button>
                    <Button
                      size="sm"
                      selected={selectedType === 'Tags'}
                      onClick={() => setSelectedType('Tags')}
                    >
                      Tags
                    </Button>
                    <Button
                      size="sm"
                      selected={selectedType === 'TagsByCategories'}
                      onClick={() => setSelectedType('TagsByCategories')}
                    >
                      Tags by Categories
                    </Button>
                    <Button
                      size="sm"
                      selected={selectedType === 'Creators'}
                      onClick={() => setSelectedType('Creators')}
                    >
                      Creators
                    </Button>
                  </div>
                  {selectedType !== 'TagsByCategories' && (
                    <Button
                      size="sm"
                      leftIcon={<PlusIcon className="h-4 w-4 mr-2" />}
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      Add {selectedType === 'Categories' ? 'category' : selectedType.slice(0, -1).toLowerCase()}
                    </Button>
                  )}
                </div>
              </ModalHeader>
              <ModalBody className="flex-1">
                <div className="h-full flex flex-col gap-4">
                  <SearchBar
                    placeholder={`Search ${selectedType.toLowerCase()}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    color="light"
                  />
                  {isAddDialogOpen && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-2 flex flex-col gap-2 border border-white/20">
                      <div className="text-base font-medium text-white mb-2">
                        {selectedType === 'Categories' ? 'Add Category' : selectedType === 'Tags' ? 'Add Tag' : 'Add Creator'}
                      </div>
                      <Input
                        placeholder="Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        color="glass"
                        inputSize="lg"
                      />
                      {selectedType === 'Categories' && (
                        <Input
                          placeholder="Description"
                          value={newItemDescription}
                          onChange={(e) => setNewItemDescription(e.target.value)}
                          color="glass"
                          inputSize="lg"
                        />
                      )}
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button size="sm" selected={true} onClick={handleAdd}>Save changes</Button>
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    {selectedType === 'TagsByCategories' ? (
                      // Special rendering for Tags by Categories
                      (() => {
                        const { uncategorizedTags, categorizedTags } = getTagsByCategories();
                        return (
                          <div className="space-y-4">
                            {/* Uncategorized Tags */}
                            {uncategorizedTags.length > 0 && (
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                  <span className="text-yellow-400">📁</span>
                                  Uncategorized Tags
                                  <span className="text-sm text-white/60">({uncategorizedTags.length})</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {uncategorizedTags.map((tag) => (
                                    <button
                                      key={tag.id}
                                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/20"
                                      onClick={() => toggleTag(tag.name)}
                                      onContextMenu={(e) => handleTagRightClick(e, tag.id, tag.name)}
                                      title={`${tag.name} - Right click to assign to category`}
                                    >
                                      {tag.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Categorized Tags */}
                            {categorizedTags.map(({ category, tags }) => (
                              <div key={category.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                  <span className="text-blue-400">📂</span>
                                  {category.name}
                                  {category.is_private && <LockIcon className="h-4 w-4 text-white/60" />}
                                  <span className="text-sm text-white/60">({tags.length})</span>
                                </h3>
                                {category.description && (
                                  <p className="text-white/60 text-sm mb-3">{category.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {tags.map((tag) => (
                                    <button
                                      key={tag.id}
                                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/20"
                                      onClick={() => toggleTag(tag.name)}
                                      title={tag.name}
                                    >
                                      {tag.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            {/* Empty state */}
                            {uncategorizedTags.length === 0 && categorizedTags.length === 0 && (
                              <div className="text-center text-white/60 py-8">
                                <p>No tags found. Create some tags first!</p>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      // Regular rendering for other types
                      filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-2 last:mb-0 border border-white/20"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <OrganizeListItem
                            item={item}
                            selectedType={selectedType as OrganizeType}
                            isEditing={editingId === item.id}
                            isDefaultCategory={item.id === defaultCategoryId}
                            editingName={editingName}
                            editingLinks={editingLinks}
                            inputStyle={inputStyle}
                            buttonStyle={buttonStyle}
                            onEdit={() => handleEdit(item.id, item.name, item)}
                            onSave={handleSave}
                            onCancel={() => {
                              setEditingId(null);
                              setEditingName('');
                              setEditingLinks({ link1: '', link2: '', link3: '' });
                            }}
                            onMerge={() => {
                              setMergeSourceId(item.id);
                              setMergeTargetId(null);
                              setMergeSearch('');
                            }}
                            onDelete={() => handleDelete(item.id)}
                            onOpenSetTags={() => handleOpenSetTags(item.id)}
                            onTogglePrivate={() => handleTogglePrivate(item.id, (isCategory(item) || isTag(item)) ? !!item.is_private : false)}
                            onItemClick={() => handleItemClick(item)}
                            setEditingName={setEditingName}
                            setEditingLinks={setEditingLinks}
                          />
                          {editingId !== item.id && (
                            <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
                              {(isCategory(item) || isTag(item)) && (
                                <Button
                                  size="sm"
                                  leftIcon={item.is_private ? <LockIcon className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}
                                  onClick={() => handleTogglePrivate(item.id, !!item.is_private)}
                                  className="flex-shrink-0"
                                />
                              )}
                              <Button
                                size="sm"
                                leftIcon={<PlusIcon className="h-4 w-4" />}
                                onClick={() => handleOpenSetTags(item.id)}
                                className="flex-shrink-0"
                              >
                                Tags
                              </Button>
                              <Button
                                size="sm"
                                leftIcon={<PencilIcon className="h-4 w-4" />}
                                onClick={() => handleEdit(item.id, item.name, item)}
                                className="flex-shrink-0"
                              />
                              <Button
                                size="sm"
                                leftIcon={<ArrowUpIcon className="h-4 w-4" />}
                                onClick={() => {
                                  setMergeSourceId(item.id);
                                  setMergeTargetId(null);
                                  setMergeSearch('');
                                }}
                                className="flex-shrink-0"
                              />
                              <Button
                                size="sm"
                                leftIcon={<TrashIcon className="h-4 w-4" />}
                                onClick={() => handleDelete(item.id)}
                                className="flex-shrink-0"
                              />
                            </div>
                          )}
                        </div>
                        {mergeSourceId === item.id && (
                          <div className="mt-4 flex flex-col gap-2 bg-white/10 backdrop-blur-sm rounded p-3 border border-white/20">
                                                          <Input
                                placeholder={`Search target ${selectedType.toLowerCase()}`}
                                value={mergeSearch}
                                onChange={e => {
                                  setMergeSearch(e.target.value);
                                  setMergeTargetId(null);
                                }}
                                color="glass"
                                className="w-full"
                              />
                            <div className="max-h-32 overflow-y-auto">
                              {getItems()
                                .filter(target =>
                                  target.id !== item.id &&
                                  target.name.toLowerCase().includes(mergeSearch.toLowerCase())
                                )
                                .slice(0, 8)
                                .map(target => (
                                  <div
                                    key={target.id}
                                    className={`px-2 py-1 rounded cursor-pointer ${mergeTargetId === target.id ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'}`}
                                    onClick={() => setMergeTargetId(target.id)}
                                  >
                                    {target.name}
                                  </div>
                                ))}
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <Button size="sm" onClick={handleCancelInlineMerge}>Cancel</Button>
                              <Button size="sm" selected={true} disabled={!mergeTargetId} onClick={handleInlineMerge}>Merge</Button>
                            </div>
                          </div>
                        )}
                        {selectedItemId === item.id && (
                          <div className="mt-4 space-y-4">
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
                              color="glass"
                              inputSize="lg"
                            />

                            {selectedTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedTags.map((tag) => (
                                  <Button
                                    key={tag}
                                    size="sm"
                                    rightIcon={<XIcon className="h-4 w-4 ml-1" />}
                                    onClick={() => handleRemoveTag(tag)}
                                    tabIndex={-1}
                                    className="max-w-40 truncate"
                                    title={tag}
                                  >
                                    <span className="truncate">{tag}</span>
                                  </Button>
                                ))}
                              </div>
                            )}

                            {(tagSearch || showCreateTag) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                                {filteredTags.map((tag) => (
                                  <Button
                                    key={tag.id}
                                    size="sm"
                                    className={`justify-start h-8 px-3 ${buttonStyle} max-w-full`}
                                    onClick={() => handleTagClick(tag.name)}
                                    title={tag.name}
                                  >
                                    <span className="truncate text-left">{tag.name}</span>
                                  </Button>
                                ))}
                                {showCreateTag && (
                                  <Button
                                    size="sm"
                                    className={`justify-start h-8 px-3 ${buttonStyle} max-w-full`}
                                    onClick={handleCreateTag}
                                    title={`Create "${tagSearch}"`}
                                  >
                                    <span className="truncate text-left">Create "{tagSearch}"</span>
                                  </Button>
                                )}
                              </div>
                            )}

                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => {
                                setSelectedItemId(null);
                                setSelectedTags([]);
                                setTagSearch('');
                              }}>Cancel</Button>
                              <Button size="sm" selected={true} onClick={handleSaveTags}>Save changes</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                </div>
              </ModalBody>
            </ModalWrapper>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Portal>

      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4 sm:px-6 outline-none">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Delete {selectedType.slice(0, -1)}</h2>
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white/80 mb-6">
                Are you sure you want to delete this {selectedType.toLowerCase()}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  size="sm" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={confirmDelete}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30 hover:border-red-400/50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Tag Assignment Modal */}
      <Dialog.Root open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <Dialog.Portal>
          <Dialog.Content 
            className="fixed z-[99999] w-80 max-w-md outline-none"
            style={{
              left: modalPosition ? Math.min(modalPosition.x, window.innerWidth - 320) : '50%',
              top: modalPosition ? Math.min(modalPosition.y, window.innerHeight - 400) : '50%',
              transform: modalPosition ? 'none' : 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex-1">
                  Assign "{selectedTagForAssignment?.name}" to:
                </h2>
                <button
                  onClick={() => {
                    setIsAssignmentModalOpen(false);
                    setModalPosition(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors ml-2"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div 
                className="max-h-80 overflow-y-auto custom-scrollbar"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
                }}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-white/60 text-sm">
                    No categories available. Create a category first.
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      className={`w-full text-left px-3 py-2 text-white text-sm hover:bg-white/20 rounded transition-colors flex items-center gap-2 ${
                        assigningTag === category.id ? 'bg-white/20' : ''
                      }`}
                      onClick={() => handleAssignTag(category.id)}
                      disabled={assigningTag === category.id}
                    >
                      <span className="text-blue-400">📂</span>
                      <span className="truncate">{category.name}</span>
                      {category.is_private && <LockIcon className="h-4 w-4 text-white/60 flex-shrink-0" />}
                      {assigningTag === category.id && (
                        <span className="text-white/60 text-xs ml-auto">Assigning...</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
};