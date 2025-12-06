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
  selectedCreators: string[];
  favoriteCreators: string[];
  showOnlyFavorites: boolean;
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
  fetchFavoriteCreators: () => Promise<void>;
  toggleFavoriteCreator: (creatorName: string) => Promise<void>;
  setSelectedCreators: (creators: string[]) => void;
  setShowOnlyFavorites: (show: boolean) => void;
  addAtom: (atom: Omit<Database['public']['Tables']['atoms']['Insert'], 'id'>) => Promise<Atom | undefined>;
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
  // Atom relationships
  fetchChildAtoms: (parentAtomId: number) => Promise<Atom[]>;
  fetchParentAtoms: (childAtomId: number) => Promise<Atom[]>;
  addChildAtom: (parentAtomId: number, childAtomId: number) => Promise<void>;
  removeChildAtom: (parentAtomId: number, childAtomId: number) => Promise<void>;
  getChildAtomCount: (parentAtomId: number) => number;
}

export const useAtomStore = create<AtomStore>((set, get) => ({
  atoms: [],
  tags: [],
  categories: [],
  creators: [],
  categoryTags: [],
  creatorTags: [],
  selectedTags: [],
  selectedCreators: [],
  favoriteCreators: [],
  showOnlyFavorites: false,
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

  setSelectedCreators: (creators: string[]) => {
    set({ selectedCreators: creators });
  },

  fetchFavoriteCreators: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'favorite_creators')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No favorite creators found, this is expected for new installations
          console.log('No favorite creators set');
          set({ favoriteCreators: [] });
          return;
        }
        console.error('Error fetching favorite creators:', error.message, error);
        return;
      }

      const creatorNames = data?.value?.creatorNames || [];
      set({ favoriteCreators: Array.isArray(creatorNames) ? creatorNames : [] });
    } catch (error) {
      console.error('Failed to fetch favorite creators:', error);
      set({ favoriteCreators: [] });
    }
  },

  toggleFavoriteCreator: async (creatorName: string) => {
    try {
      const currentFavorites = get().favoriteCreators;
      const isFavorite = currentFavorites.includes(creatorName);
      const newFavorites = isFavorite
        ? currentFavorites.filter(name => name !== creatorName)
        : [...currentFavorites, creatorName];

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'favorite_creators',
          value: { creatorNames: newFavorites },
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error toggling favorite creator:', error.message, error);
        throw error;
      }

      set({ favoriteCreators: newFavorites });
    } catch (error) {
      console.error('Failed to toggle favorite creator:', error);
    }
  },

  setShowOnlyFavorites: (show: boolean) => {
    set({ showOnlyFavorites: show });
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

      if (data && data[0]) {
        const newAtom = data[0];
        
        // Handle atom_creators join table if creator_name is provided
        if (atom.creator_name) {
          const creatorNames = atom.creator_name.split(',').map(s => s.trim()).filter(Boolean);
          const { data: allCreators } = await supabase.from('creators').select('*');
          const creatorIds = [];
          for (const name of creatorNames) {
            let creator = allCreators?.find((c: any) => c.name === name);
            if (!creator) {
              const { data: newCreator } = await supabase.from('creators').insert([{ name, count: 1 }]).select().single();
              creator = newCreator;
            }
            if (creator) creatorIds.push(creator.id);
          }
          // Add creator links
          for (const creator_id of creatorIds) {
            await supabase.from('atom_creators').insert([{ atom_id: newAtom.id, creator_id }]);
          }
        }
        
        const atoms = get().atoms;
        // Prepend new atom to appear at top of feed (newest first)
        set({ atoms: [newAtom, ...atoms] });
        return newAtom;
      }
      return undefined;
    } catch (error) {
      console.error('Failed to add atom:', error);
      return undefined;
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
      console.log('updateAtom called with:', { id, updates });
      // Normalize tags if they're being updated
      // Always ensure tags is an array (even if empty) when explicitly updating
      const normalizedUpdates = { ...updates };
      if ('tags' in updates) {
        // If tags is explicitly provided (even if null or undefined), normalize it
        normalizedUpdates.tags = updates.tags 
          ? updates.tags.map(normalizeTagName).filter(Boolean)
          : [];
      }
      
      // Remove prompt field if it's empty or if the column doesn't exist in the database
      // This prevents errors if the migration hasn't been applied yet
      // TODO: Remove this check once the prompt column migration is confirmed to be applied
      if ('prompt' in normalizedUpdates) {
        // Only include prompt if it has a value (not empty string, null, or undefined)
        const promptValue = normalizedUpdates.prompt;
        if (!promptValue || (typeof promptValue === 'string' && promptValue.trim() === '')) {
          delete normalizedUpdates.prompt;
        }
      }
      
      console.log('normalizedUpdates:', normalizedUpdates);

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

      console.log('Calling supabase update with:', { id, normalizedUpdates });
      
      // Ensure tags is properly formatted as an array for Supabase
      if ('tags' in normalizedUpdates) {
        // Supabase expects tags as a string array, ensure it's always an array
        normalizedUpdates.tags = Array.isArray(normalizedUpdates.tags) 
          ? normalizedUpdates.tags 
          : [];
      }
      
      let { data, error } = await supabase
        .from('atoms')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();

      // If error is about prompt column not existing, retry without prompt
      if (error && error.message && error.message.includes("prompt") && error.message.includes("schema cache")) {
        console.warn('Prompt column not found, retrying update without prompt field');
        const updatesWithoutPrompt = { ...normalizedUpdates };
        delete updatesWithoutPrompt.prompt;
        
        const retryResult = await supabase
          .from('atoms')
          .update(updatesWithoutPrompt)
          .eq('id', id)
          .select()
          .single();
        
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('Error updating atom:', error.message, error);
        console.error('Update payload was:', normalizedUpdates);
        throw error;
      }
      console.log('Supabase update successful, returned data:', data);

      // Use the data returned from Supabase to update local state
      // This ensures we have the exact values from the database
      if (data) {
        const atoms = get().atoms.map((atom: Atom) =>
          atom.id === id ? { ...atom, ...data } : atom
        );
        set({ atoms });
        console.log('Successfully updated atom in store with database data');
      } else {
        // Fallback to normalizedUpdates if no data returned
        const atoms = get().atoms.map((atom: Atom) =>
          atom.id === id ? { ...atom, ...normalizedUpdates } : atom
        );
        set({ atoms });
        console.log('Successfully updated atom in store with normalized updates');
      }
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
      console.log(`Merging category ${sourceId} into ${targetId}`);
      
      // 1. Get current category tags to check for potential duplicates
      const sourceTags = get().getCategoryTags(sourceId);
      const targetTags = get().getCategoryTags(targetId);
      
      console.log(`Source category has ${sourceTags.length} tags, target has ${targetTags.length} tags`);
      
      // 2. Handle potential duplicates by removing source assignments for tags already in target
      const targetTagIds = new Set(targetTags.map(t => t.id));
      const duplicateSourceTags = sourceTags.filter(tag => targetTagIds.has(tag.id));
      
      if (duplicateSourceTags.length > 0) {
        console.log(`Found ${duplicateSourceTags.length} duplicate tags, removing from source category`);
        for (const tag of duplicateSourceTags) {
          await get().removeTagFromCategory(sourceId, tag.id);
        }
      }
      
      // 3. Update remaining category_tags entries from source to target
      const { error: updateError } = await supabase
        .from('category_tags')
        .update({ category_id: targetId })
        .eq('category_id', sourceId);

      if (updateError) {
        console.error('Error updating category relationships:', updateError.message, updateError);
        throw updateError;
      }

      console.log('Successfully updated category_tags relationships');

      // 4. Check if source category is the default category and update if needed
      if (get().defaultCategoryId === sourceId) {
        console.log('Source category was the default category, updating to target category');
        await get().setDefaultCategory(targetId);
      }
      
      // 5. Delete the source category
      await get().deleteCategory(sourceId);
      
      // 6. Refresh category tags data to update the UI
      await get().fetchCategoryTags();
      
      console.log('Category merge completed successfully');
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
  },

  // Atom relationships
  fetchChildAtoms: async (parentAtomId: number) => {
    try {
      // Use simple approach: fetch relationships first, then fetch atoms
      const { data: relData, error: relError } = await supabase
        .from('atom_relationships')
        .select('child_atom_id')
        .eq('parent_atom_id', parentAtomId);
      
      if (relError) {
        console.error('Error fetching child atom relationships:', relError.message, relError);
        // If table doesn't exist (404), return empty array
        if (relError.code === 'PGRST116' || relError.message.includes('404')) {
          console.warn('atom_relationships table may not exist. Please run the migration.');
          return [];
        }
        throw relError;
      }
      
      if (relData && relData.length > 0) {
        const childIds = relData.map((rel: any) => rel.child_atom_id);
        const { data: atomsData, error: atomsError } = await supabase
          .from('atoms')
          .select('*')
          .in('id', childIds);
        
        if (atomsError) {
          console.error('Error fetching child atoms:', atomsError.message, atomsError);
          throw atomsError;
        }
        
        return atomsData || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch child atoms:', error);
      return [];
    }
  },

  fetchParentAtoms: async (childAtomId: number) => {
    try {
      console.log('fetchParentAtoms called for childAtomId:', childAtomId);
      
      // Fetch parent atom IDs
      const { data: relData, error: relError } = await supabase
        .from('atom_relationships')
        .select('parent_atom_id')
        .eq('child_atom_id', childAtomId);
      
      if (relError) {
        console.error('Error fetching parent atom IDs:', relError.message, relError);
        // If table doesn't exist (404), return empty array
        if (relError.code === 'PGRST116' || relError.message.includes('404')) {
          console.warn('atom_relationships table may not exist. Please run the migration.');
          return [];
        }
        throw relError;
      }
      
      console.log('Parent relationships found:', relData);
      
      if (relData && relData.length > 0) {
        const parentIds = relData.map((rel: any) => rel.parent_atom_id);
        console.log('Fetching parent atoms with IDs:', parentIds);
        
        const { data: atomsData, error: atomsError } = await supabase
          .from('atoms')
          .select('*')
          .in('id', parentIds);
        
        if (atomsError) {
          console.error('Error fetching parent atoms:', atomsError.message, atomsError);
          throw atomsError;
        }
        
        console.log('Parent atoms fetched:', atomsData);
        return atomsData || [];
      }
      console.log('No parent relationships found');
      return [];
    } catch (error) {
      console.error('Failed to fetch parent atoms:', error);
      return [];
    }
  },

  addChildAtom: async (parentAtomId: number, childAtomId: number) => {
    try {
      // Prevent self-reference
      if (parentAtomId === childAtomId) {
        throw new Error('Cannot add atom as its own child');
      }

      console.log('addChildAtom called:', { parentAtomId, childAtomId });

      const { data, error } = await supabase
        .from('atom_relationships')
        .insert([{
          parent_atom_id: parentAtomId,
          child_atom_id: childAtomId
        }])
        .select();
      
      if (error) {
        console.error('❌ Error adding child atom:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        // If table doesn't exist (404), provide helpful error
        if (error.code === 'PGRST116' || error.message.includes('404')) {
          throw new Error('atom_relationships table does not exist. Please run the migration: supabase/migrations/20250121000000_add_atom_relationships.sql');
        }
        throw error;
      }
      
      console.log('✅ Child atom relationship created successfully:', data);
      if (!data || data.length === 0) {
        console.warn('⚠️ Insert returned no data - relationship may not have been created');
      }
    } catch (error) {
      console.error('Failed to add child atom:', error);
      throw error;
    }
  },

  removeChildAtom: async (parentAtomId: number, childAtomId: number) => {
    try {
      const { error } = await supabase
        .from('atom_relationships')
        .delete()
        .eq('parent_atom_id', parentAtomId)
        .eq('child_atom_id', childAtomId);
      
      if (error) {
        console.error('Error removing child atom:', error.message, error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove child atom:', error);
      throw error;
    }
  },

  getChildAtomCount: (parentAtomId: number) => {
    // This is a synchronous helper that could be optimized with caching
    // For now, we'll need to fetch this separately or cache it
    // Returning 0 as placeholder - actual count should be fetched
    return 0;
  },

}));