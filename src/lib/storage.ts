import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const uploadImage = async (file: File) => {
  try {
    // Validate that we have a valid File object
    if (!(file instanceof File)) {
      throw new Error('Invalid file object provided');
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type. Allowed types: ${ALLOWED_IMAGE_TYPES.map(type => type.split('/')[1]).join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Get file extension from MIME type
    const fileExt = file.type.split('/')[1];
    if (!fileExt) {
      throw new Error('Invalid file type');
    }

    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Create a new File object with the correct MIME type
    const fileWithMimeType = new File([file], fileName, {
      type: file.type
    });

    // Upload file with explicit content type
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

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('atoms')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};