import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for video
const ALLOWED_MEDIA_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg', 'video/x-matroska'
];

export const uploadMedia = async (file: File) => {
  try {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object provided');
    }
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type. Allowed types: ${ALLOWED_MEDIA_TYPES.map(type => type.split('/')[1]).join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    const fileExt = file.type.split('/')[1];
    if (!fileExt) {
      throw new Error('Invalid file type');
    }
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `images/${fileName}`;
    const fileWithMimeType = new File([file], fileName, { type: file.type });
    const { error: uploadError } = await supabase.storage
      .from('atoms')
      .upload(filePath, fileWithMimeType, {
        cacheControl: '3600',
        upsert: false
      });
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(uploadError.message);
    }
    const { data: { publicUrl } } = supabase.storage
      .from('atoms')
      .getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};