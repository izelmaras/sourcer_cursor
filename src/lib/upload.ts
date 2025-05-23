import { supabase } from './supabase';

export const uploadCreatorImage = async (file: File, creatorId: number): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${creatorId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('creators')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('creators')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadCreatorImage:', error);
    return null;
  }
};

export const deleteCreatorImage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('creators')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCreatorImage:', error);
    return false;
  }
}; 