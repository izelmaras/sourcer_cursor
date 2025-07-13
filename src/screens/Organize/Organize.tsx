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
  initialType?: 'Categories' | 'Tags' | 'Creators';
  onCreatorSelect?: (creator: string) => void;
}

// --- TYPE DEFINITIONS ---
type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type Creator = Database['public']['Tables']['creators']['Row'];

enum OrganizeType {
  Categories = 'Categories',
  Tags = 'Tags',
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
  const [selectedType, setSelectedType] = useState<'Categories' | 'Tags' | 'Creators'>(initialType);
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

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchTags(),
        fetchCreators(),
        fetchCreatorTags()
      ]);
    };
    
    initializeData();
  }, [fetchCategories, fetchTags, fetchCreators, fetchCreatorTags]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const getItems = () => {
    const items = (() => {
      switch (selectedType) {
        case 'Categories':
          return categories;
        case 'Tags':
          return tags;
        case 'Creators':
          return creators;
        default:
          return [];
      }
    })();

    return [...items].sort((a, b) => a.name.localeCompare(b.name));
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

  const buttonStyle = "bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200";
  const inputStyle = "bg-white text-gray-900 border border-gray-900 focus:ring-2 focus:ring-gray-900";

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
              color="light"
              inputSize="lg"
            />
            {selectedType === OrganizeType.Creators && (
              <>
                <Input 
                  value={editingLinks.link1} 
                  onChange={e => setEditingLinks({ ...editingLinks, link1: e.target.value })} 
                  placeholder="Link 1" 
                  color="light"
                  inputSize="lg"
                />
                <Input 
                  value={editingLinks.link2} 
                  onChange={e => setEditingLinks({ ...editingLinks, link2: e.target.value })} 
                  placeholder="Link 2" 
                  color="light"
                  inputSize="lg"
                />
                <Input 
                  value={editingLinks.link3} 
                  onChange={e => setEditingLinks({ ...editingLinks, link3: e.target.value })} 
                  placeholder="Link 3" 
                  color="light"
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
      <div className="flex-grow text-left cursor-pointer hover:text-gray-600" onClick={onItemClick}>
        <div className="flex items-center gap-2">
          <span className="text-gray-900">{item.name}</span>
          {selectedType === OrganizeType.Categories && isDefaultCategory && <StarIcon className="h-4 w-4 text-yellow-500" />}
          {((selectedType === OrganizeType.Categories || selectedType === OrganizeType.Creators) && 'count' in item && typeof item.count === 'number') && (
            <span className="text-gray-500 text-sm">({item.count || 0} instances)</span>
          )}
        </div>
        {selectedType === OrganizeType.Creators && (
          <div className="flex flex-wrap gap-2 mt-1">
            {'link_1' in item && item.link_1 && (
              <a href={item.link_1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><LinkIcon className="h-3 w-3" />Link 1</a>
            )}
            {'link_2' in item && item.link_2 && (
              <a href={item.link_2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><LinkIcon className="h-3 w-3" />Link 2</a>
            )}
            {'link_3' in item && item.link_3 && (
              <a href={item.link_3} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><LinkIcon className="h-3 w-3" />Link 3</a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl px-4 sm:px-6 outline-none max-h-[80vh]">
          <ScrollArea className="max-h-[80vh] overflow-y-auto">
            <ModalWrapper className="max-h-[80vh] h-auto flex flex-col">
              <ModalHeader className="flex-none pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex flex-wrap gap-2">
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
                      selected={selectedType === 'Creators'}
                      onClick={() => setSelectedType('Creators')}
                    >
                      Creators
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={<PlusIcon className="h-4 w-4 mr-2" />}
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add {selectedType === 'Categories' ? 'category' : selectedType.slice(0, -1).toLowerCase()}
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody className="flex-1">
                <div className="h-full flex flex-col gap-4">
                  <SearchBar
                    placeholder={`Search ${selectedType.toLowerCase()}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputStyle}
                  />
                  {isAddDialogOpen && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-2 flex flex-col gap-2">
                      <div className="text-base font-medium text-gray-900 mb-2">
                        {selectedType === 'Categories' ? 'Add Category' : selectedType === 'Tags' ? 'Add Tag' : 'Add Creator'}
                      </div>
                      <Input
                        placeholder="Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        color="light"
                        inputSize="lg"
                      />
                      {selectedType === 'Categories' && (
                        <Input
                          placeholder="Description"
                          value={newItemDescription}
                          onChange={(e) => setNewItemDescription(e.target.value)}
                          color="light"
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
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-4 mb-2 last:mb-0"
                      >
                        <div className="flex items-center justify-between gap-4">
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
                            <div className="flex gap-2">
                              {(isCategory(item) || isTag(item)) && (
                                <Button
                                  size="sm"
                                  leftIcon={item.is_private ? <LockIcon className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}
                                  onClick={() => handleTogglePrivate(item.id, !!item.is_private)}
                                />
                              )}
                              <Button
                                size="sm"
                                leftIcon={<PlusIcon className="h-4 w-4" />}
                                onClick={() => handleOpenSetTags(item.id)}
                              >
                                Tags
                              </Button>
                              <Button
                                size="sm"
                                leftIcon={<PencilIcon className="h-4 w-4" />}
                                onClick={() => handleEdit(item.id, item.name, item)}
                              />
                              <Button
                                size="sm"
                                leftIcon={<ArrowUpIcon className="h-4 w-4" />}
                                onClick={() => {
                                  setMergeSourceId(item.id);
                                  setMergeTargetId(null);
                                  setMergeSearch('');
                                }}
                              />
                              <Button
                                size="sm"
                                leftIcon={<TrashIcon className="h-4 w-4" />}
                                onClick={() => handleDelete(item.id)}
                              />
                            </div>
                          )}
                        </div>
                        {mergeSourceId === item.id && (
                          <div className="mt-4 flex flex-col gap-2 bg-gray-100 rounded p-3">
                            <Input
                              placeholder={`Search target ${selectedType.toLowerCase()}`}
                              value={mergeSearch}
                              onChange={e => {
                                setMergeSearch(e.target.value);
                                setMergeTargetId(null);
                              }}
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
                                    className={`px-2 py-1 rounded cursor-pointer ${mergeTargetId === target.id ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
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
                              color="light"
                              inputSize="lg"
                            />

                            {selectedTags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag) => (
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
                                    className={`justify-start h-8 px-3 ${buttonStyle}`}
                                    onClick={() => handleTagClick(tag.name)}
                                  >
                                    {tag.name}
                                  </Button>
                                ))}
                                {showCreateTag && (
                                  <Button
                                    size="sm"
                                    className={`justify-start h-8 px-3 ${buttonStyle}`}
                                    onClick={handleCreateTag}
                                  >
                                    Create "{tagSearch}"
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
                    ))}
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
            <ModalWrapper>
              <ModalHeader>Delete {selectedType.slice(0, -1)}</ModalHeader>
              <ModalBody>
                <p className="text-gray-600">
                  Are you sure you want to delete this {selectedType.toLowerCase()}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button size="sm" selected={true} style={{borderColor: 'red', color: 'red'}} onClick={confirmDelete}>Delete</Button>
                </div>
              </ModalBody>
            </ModalWrapper>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
};