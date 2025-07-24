import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Atom = Database['public']['Tables']['atoms']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Creator = Database['public']['Tables']['creators']['Row'];
type CategoryTag = Database['public']['Tables']['category_tags']['Row'];
type CreatorTag = Database['public']['Tables']['creator_tags']['Row'];

// Helper function to normalize tag names
const normalizeTagName = (name: string): string => {
  return name.trim()
    // Convert to lowercase
    .toLowerCase()
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ');
};

// Performance optimization: Create lookup maps for faster access
const createCategoryTagLookup = (categoryTags: CategoryTag[], tags: Tag[]) => {
  const lookup = new Map<number, Tag[]>();
  
  // Group category tags by category ID
  const categoryTagGroups = new Map<number, number[]>();
  categoryTags.forEach(ct => {
    if (!categoryTagGroups.has(ct.category_id)) {
      categoryTagGroups.set(ct.category_id, []);
    }
    categoryTagGroups.get(ct.category_id)!.push(ct.tag_id);
  });
  
  // Create tag lookup for faster access
  const tagMap = new Map(tags.map(tag => [tag.id, tag]));
  
  // Build the final lookup
  categoryTagGroups.forEach((tagIds, categoryId) => {
    const categoryTags = tagIds
      .map(tagId => tagMap.get(tagId))
      .filter(Boolean) as Tag[];
    lookup.set(categoryId, categoryTags);
  });
  
  return lookup;
};

const createCreatorTagLookup = (creatorTags: CreatorTag[], tags: Tag[]) => {
  const lookup = new Map<number, Tag[]>();
  
  // Group creator tags by creator ID
  const creatorTagGroups = new Map<number, number[]>();
  creatorTags.forEach(ct => {
    if (!creatorTagGroups.has(ct.creator_id)) {
      creatorTagGroups.set(ct.creator_id, []);
    }
    creatorTagGroups.get(ct.creator_id)!.push(ct.tag_id);
  });
  
  // Create tag lookup for faster access
  const tagMap = new Map(tags.map(tag => [tag.id, tag]));
  
  // Build the final lookup
  creatorTagGroups.forEach((tagIds, creatorId) => {
    const creatorTags = tagIds
      .map(tagId => tagMap.get(tagId))
      .filter(Boolean) as Tag[];
    lookup.set(creatorId, creatorTags);
  });
  
  return lookup;
};

interface AtomStore {
  atoms: Atom[];
  tags: Tag[];
  categories: Category[];
  creators: Creator[];
  categoryTags: CategoryTag[];
  creatorTags: CreatorTag[];
  selectedTags: string[];
  selectedCreator: string | null;
  loading: boolean;
  deletingIds: number[];
  defaultCategoryId: number | null;
  isTagDrawerCollapsed: boolean;
  // Performance optimization: Cached lookups
  categoryTagLookup: Map<number, Tag[]>;
  creatorTagLookup: Map<number, Tag[]>;
  fetchAtoms: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCreators: () => Promise<void>;
  fetchCategoryTags: () => Promise<void>;
  fetchCreatorTags: () => Promise<void>;
  fetchDefaultCategory: () => Promise<void>;
  setDefaultCategory: (categoryId: number | null) => Promise<void>;
  setSelectedCreator: (creator: string | null) => void;
  addAtom: (atom: Omit<Database['public']['Tables']['atoms']['Insert'], 'id'>) => Promise<void>;
  updateAtom: (id: number, updates: Partial<Database['public']['Tables']['atoms']['Update']>) => Promise<void>;
  addTag: (tag: Omit<Database['public']['Tables']['tags']['Insert'], 'id'>) => Promise<void>;
  addCategory: (category: Omit<Database['public']['Tables']['categories']['Insert'], 'id'>) => Promise<void>;
  addCreator: (creator: Omit<Database['public']['Tables']['creators']['Insert'], 'id'>) => Promise<void>;
  updateTag: (id: number, name?: string, isPrivate?: boolean) => Promise<void>;
  updateCategory: (id: number, name?: string, isPrivate?: boolean) => Promise<void>;
  updateCreator: (id: number, updates: Partial<Database['public']['Tables']['creators']['Update']>) => Promise<void>;
  deleteAtom: (id: number) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  deleteCreator: (id: number) => Promise<void>;
  mergeTag: (sourceId: number, targetId: number) => Promise<void>;
  mergeCategory: (sourceId: number, targetId: number) => Promise<void>;
  mergeCreator: (sourceId: number, targetId: number) => Promise<void>;
  assignTagToCategory: (categoryId: number, tagId: number) => Promise<void>;
  removeTagFromCategory: (categoryId: number, tagId: number) => Promise<void>;
  assignTagToCreator: (creatorId: number, tagId: number) => Promise<void>;
  removeTagFromCreator: (creatorId: number, tagId: number) => Promise<void>;
  getCategoryTags: (categoryId: number) => Tag[];
  getCreatorTags: (creatorId: number) => Tag[];
  toggleTag: (tagName: string) => void;
  clearSelectedTags: () => void;
  setTagDrawerCollapsed: (collapsed: boolean) => void;
}

export const useAtomStore = create<AtomStore>((set, get) => ({
  atoms: [],
  tags: [],
  categories: [],
  creators: [],
  categoryTags: [],
  creatorTags: [],
  selectedTags: [],
  selectedCreator: null,
  loading: false,
  deletingIds: [],
  defaultCategoryId: null,
  isTagDrawerCollapsed: true,
  categoryTagLookup: new Map(),
  creatorTagLookup: new Map(),

  fetchAtoms: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('atoms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching atoms:', error.message, error);
        throw error;
      }
      
      // Normalize tags in atoms
      const normalizedAtoms = data?.map(atom => ({
        ...atom,
        tags: atom.tags?.map(normalizeTagName) || null
      })) || [];
      
      set({ atoms: normalizedAtoms });
    } catch (error) {
      console.error('Failed to fetch atoms:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTags: async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('count', { ascending: false });
      
      if (error) {
        console.error('Error fetching tags:', error.message, error);
        throw error;
      }
      
      // Normalize tag names
      const normalizedTags = data?.map((tag: Tag) => ({
        ...tag,
        name: normalizeTagName(tag.name)
      })) || [];
      
      // Rebuild lookups with new tags
      const categoryTags = get().categoryTags;
      const creatorTags = get().creatorTags;
      const categoryTagLookup = createCategoryTagLookup(categoryTags, normalizedTags);
      const creatorTagLookup = createCreatorTagLookup(creatorTags, normalizedTags);
      
      set({ tags: normalizedTags, categoryTagLookup, creatorTagLookup });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error.message, error);
        throw error;
      }
      
      set({ categories: data || [] });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchCreators: async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('count', { ascending: false });
      
      if (error) {
        console.error('Error fetching creators:', error.message, error);
        throw error;
      }
      
      set({ creators: data || [] });
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    }
  },

  fetchCategoryTags: async () => {
    try {
      const { data, error } = await supabase
        .from('category_tags')
        .select('*');
      
      if (error) {
        console.error('Error fetching category tags:', error.message, error);
        throw error;
      }
      
      const categoryTags = data || [];
      const tags = get().tags;
      const categoryTagLookup = createCategoryTagLookup(categoryTags, tags);
      
      set({ categoryTags, categoryTagLookup });
    } catch (error) {
      console.error('Failed to fetch category tags:', error);
    }
  },

  fetchCreatorTags: async () => {
    try {
      const { data, error } = await supabase
        .from('creator_tags')
        .select('*');
      
      if (error) {
        console.error('Error fetching creator tags:', error.message, error);
        throw error;
      }
      
      const creatorTags = data || [];
      const tags = get().tags;
      const creatorTagLookup = createCreatorTagLookup(creatorTags, tags);
      
      set({ creatorTags, creatorTagLookup });
    } catch (error) {
      console.error('Failed to fetch creator tags:', error);
    }
  },

  fetchDefaultCategory: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'default_category')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No default category found, this is expected for new installations
          console.log('No default category set');
          set({ defaultCategoryId: null });
          return;
        }
        console.error('Error fetching default category:', error.message, error);
        return;
      }

      set({ defaultCategoryId: data?.value?.categoryId || null });
    } catch (error) {
      console.error('Failed to fetch default category:', error);
      set({ defaultCategoryId: null });
    }
  },

  setDefaultCategory: async (categoryId: number | null) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'default_category',
          value: { categoryId },
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error setting default category:', error.message, error);
        throw error;
      }

      set({ defaultCategoryId: categoryId });
    } catch (error) {
      console.error('Failed to set default category:', error);
    }
  },

  setSelectedCreator: (creator: string | null) => {
    set({ selectedCreator: creator });
  },

  addAtom: async (atom) => {
    try {
      // Normalize tags before adding
      const normalizedTags = atom.tags?.map(normalizeTagName);
      
      const { data, error } = await supabase
        .from('atoms')
        .insert([{ ...atom, tags: normalizedTags }])
        .select();

      if (error) {
        console.error('Error adding atom:', error.message, error);
        throw error;
      }

      const atoms = get().atoms;
      set({ atoms: [...atoms, data[0]] });
    } catch (error) {
      console.error('Failed to add atom:', error);
    }
  },

  addTag: async (tag) => {
    try {
      const normalizedName = normalizeTagName(tag.name);
      
      // Check if normalized tag already exists
      const existingTag = get().tags.find(t => normalizeTagName(t.name) === normalizedName);
      if (existingTag) {
        return;
      }

      const { data, error } = await supabase
        .from('tags')
        .insert([{ ...tag, name: normalizedName }])
        .select();

      if (error) {
        console.error('Error adding tag:', error.message, error);
        throw error;
      }

      const tags = get().tags;
      set({ tags: [...tags, data[0]] });
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  },

  updateAtom: async (id, updates) => {
    try {
      // Normalize tags if they're being updated
      const normalizedUpdates = updates.tags 
        ? { ...updates, tags: updates.tags.map(normalizeTagName) }
        : updates;

      // --- MULTI-CREATOR LOGIC START ---
      if (updates.creator_name) {
        // Parse creators from comma-separated string
        const creatorNames = updates.creator_name.split(',').map(s => s.trim()).filter(Boolean);
        const { data: allCreators } = await supabase.from('creators').select('*');
        // Ensure all creators exist, add if missing
        const creatorIds = [];
        for (const name of creatorNames) {
          let creator = allCreators?.find((c: any) => c.name === name);
          if (!creator) {
            const { data: newCreator } = await supabase.from('creators').insert([{ name, count: 1 }]).select().single();
            creator = newCreator;
          }
          if (creator) creatorIds.push(creator.id);
        }
        // Remove old links
        await supabase.from('atom_creators').delete().eq('atom_id', id);
        // Add new links
        for (const creator_id of creatorIds) {
          await supabase.from('atom_creators').insert([{ atom_id: id, creator_id }]);
        }
      }
      // --- MULTI-CREATOR LOGIC END ---

      const { error } = await supabase
        .from('atoms')
        .update(normalizedUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating atom:', error.message, error);
        throw error;
      }

      const atoms = get().atoms.map((atom: Atom) =>
        atom.id === id ? { ...atom, ...normalizedUpdates } : atom
      );
      set({ atoms });
    } catch (error) {
      console.error('Failed to update atom:', error);
    }
  },

  updateTag: async (id, name?: string, isPrivate?: boolean) => {
    try {
      const updates: Partial<Database['public']['Tables']['tags']['Update']> = {};
      if (name !== undefined) updates.name = normalizeTagName(name);
      if (isPrivate !== undefined) updates.is_private = isPrivate;

      const { error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating tag:', error.message, error);
        throw error;
      }

      const tags = get().tags.map(tag =>
        tag.id === id ? { ...tag, ...updates } : tag
      );
      set({ tags });

      // Update tag names in atoms if name was changed
      if (name !== undefined) {
        const oldTag = get().tags.find(t => t.id === id);
        if (oldTag) {
          const atoms = get().atoms.map(atom => ({
            ...atom,
            tags: atom.tags?.map((t: string) => t === oldTag.name ? normalizeTagName(name) : t) || null
          }));
          set({ atoms });
        }
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  },

  updateCategory: async (id, name?: string, isPrivate?: boolean) => {
    try {
      const updates: Partial<Database['public']['Tables']['categories']['Update']> = {};
      if (name !== undefined) updates.name = name;
      if (isPrivate !== undefined) updates.is_private = isPrivate;

      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating category:', error.message, error);
        throw error;
      }

      const categories = get().categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      );
      set({ categories });
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  },

  updateCreator: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('creators')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating creator:', error.message, error);
        throw error;
      }

      const creators = get().creators.map(creator =>
        creator.id === id ? { ...creator, ...updates } : creator
      );
      set({ creators });
    } catch (error) {
      console.error('Failed to update creator:', error);
    }
  },

  deleteAtom: async (id) => {
    try {
      set(state => ({ deletingIds: [...state.deletingIds, id] }));

      const { error } = await supabase
        .from('atoms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting atom:', error.message, error);
        throw error;
      }

      set(state => ({ 
        atoms: state.atoms.filter(atom => atom.id !== id),
        deletingIds: state.deletingIds.filter(deleteId => deleteId !== id)
      }));
    } catch (error) {
      console.error('Failed to delete atom:', error);
      set(state => ({ deletingIds: state.deletingIds.filter(deleteId => deleteId !== id) }));
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tag:', error.message, error);
        throw error;
      }

      const tags = get().tags.filter(tag => tag.id !== id);
      set({ tags });
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error.message, error);
        throw error;
      }

      const categories = get().categories.filter(category => category.id !== id);
      set({ categories });

      // If this was the default category, clear the setting
      if (get().defaultCategoryId === id) {
        await get().setDefaultCategory(null);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  },

  deleteCreator: async (id) => {
    try {
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting creator:', error.message, error);
        throw error;
      }

      const creators = get().creators.filter(creator => creator.id !== id);
      set({ creators });
    } catch (error) {
      console.error('Failed to delete creator:', error);
    }
  },

  mergeTag: async (sourceId, targetId) => {
    try {
      const sourceTag = get().tags.find(t => t.id === sourceId);
      const targetTag = get().tags.find(t => t.id === targetId);
      
      if (!sourceTag || !targetTag) return;

      const { data: atoms, error: fetchError } = await supabase
        .from('atoms')
        .select('*')
        .contains('tags', [sourceTag.name]);

      if (fetchError) {
        console.error('Error fetching atoms for tag merge:', fetchError.message, fetchError);
        throw fetchError;
      }

      if (atoms) {
        for (const atom of atoms) {
          const updatedTags = atom.tags?.map((t: string) => t === sourceTag.name ? targetTag.name : t);
          const { error: updateError } = await supabase
            .from('atoms')
            .update({ tags: updatedTags })
            .eq('id', atom.id);

          if (updateError) {
            console.error('Error updating atom tags during merge:', updateError.message, updateError);
            throw updateError;
          }
        }
      }

      await get().deleteTag(sourceId);
    } catch (error) {
      console.error('Failed to merge tags:', error);
    }
  },

  mergeCategory: async (sourceId, targetId) => {
    try {
      const { error: updateError } = await supabase
        .from('category_tags')
        .update({ category_id: targetId })
        .eq('category_id', sourceId);

      if (updateError) {
        console.error('Error updating category relationships:', updateError.message, updateError);
        throw updateError;
      }

      await get().deleteCategory(sourceId);
    } catch (error) {
      console.error('Failed to merge categories:', error);
    }
  },

  mergeCreator: async (sourceId, targetId) => {
    try {
      const sourceCreator = get().creators.find(c => c.id === sourceId);
      const targetCreator = get().creators.find(c => c.id === targetId);
      
      if (!sourceCreator || !targetCreator) return;

      const { error: updateError } = await supabase
        .from('atoms')
        .update({ creator_name: targetCreator.name })
        .eq('creator_name', sourceCreator.name);

      if (updateError) {
        console.error('Error updating creator references:', updateError.message, updateError);
        throw updateError;
      }

      await get().deleteCreator(sourceId);
    } catch (error) {
      console.error('Failed to merge creators:', error);
    }
  },

  assignTagToCategory: async (categoryId, tagId) => {
    try {
      const { error } = await supabase
        .from('category_tags')
        .insert([{ category_id: categoryId, tag_id: tagId }]);

      if (error) {
        console.error('Error assigning tag to category:', error.message, error);
        throw error;
      }

      await get().fetchCategoryTags();
    } catch (error) {
      console.error('Failed to assign tag to category:', error);
    }
  },

  removeTagFromCategory: async (categoryId, tagId) => {
    try {
      const { error } = await supabase
        .from('category_tags')
        .delete()
        .eq('category_id', categoryId)
        .eq('tag_id', tagId);

      if (error) {
        console.error('Error removing tag from category:', error.message, error);
        throw error;
      }

      await get().fetchCategoryTags();
    } catch (error) {
      console.error('Failed to remove tag from category:', error);
    }
  },

  assignTagToCreator: async (creatorId, tagId) => {
    try {
      const { error } = await supabase
        .from('creator_tags')
        .insert([{ creator_id: creatorId, tag_id: tagId }]);

      if (error) {
        console.error('Error assigning tag to creator:', error.message, error);
        throw error;
      }

      await get().fetchCreatorTags();
    } catch (error) {
      console.error('Failed to assign tag to creator:', error);
    }
  },

  removeTagFromCreator: async (creatorId, tagId) => {
    try {
      const { error } = await supabase
        .from('creator_tags')
        .delete()
        .eq('creator_id', creatorId)
        .eq('tag_id', tagId);

      if (error) {
        console.error('Error removing tag from creator:', error.message, error);
        throw error;
      }

      await get().fetchCreatorTags();
    } catch (error) {
      console.error('Failed to remove tag from creator:', error);
    }
  },

  getCategoryTags: (categoryId) => {
    return get().categoryTagLookup.get(categoryId) || [];
  },

  getCreatorTags: (creatorId) => {
    return get().creatorTagLookup.get(creatorId) || [];
  },

  toggleTag: (tagName: string) => {
    const normalizedName = normalizeTagName(tagName);
    const selectedTags = get().selectedTags;
    const newSelectedTags = selectedTags.includes(normalizedName)
      ? selectedTags.filter(t => t !== normalizedName)
      : [...selectedTags, normalizedName];
    set({ selectedTags: newSelectedTags });
  },

  clearSelectedTags: () => {
    set({ selectedTags: [] });
  },

  setTagDrawerCollapsed: (collapsed: boolean) => {
    set({ isTagDrawerCollapsed: collapsed });
  },

  addCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();

      if (error) {
        console.error('Error adding category:', error.message, error);
        throw error;
      }

      const categories = get().categories;
      set({ categories: [...categories, data[0]] });
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  },

  addCreator: async (creator) => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .insert([creator])
        .select();

      if (error) {
        console.error('Error adding creator:', error.message, error);
        throw error;
      }

      const creators = get().creators;
      set({ creators: [...creators, data[0]] });
    } catch (error) {
      console.error('Failed to add creator:', error);
      throw error; // Re-throw to handle in the UI
    }
  }
}));