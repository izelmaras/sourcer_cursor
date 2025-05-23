import React, { useState } from 'react';
import { Dropzone } from './dropzone';
import { uploadCreatorImage } from '../../lib/upload';
import { supabase } from '../../lib/supabase';

interface CreatorUploadProps {
  creatorId: number;
  onUploadComplete?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const CreatorUpload: React.FC<CreatorUploadProps> = ({
  creatorId,
  onUploadComplete,
  onError,
  className
}: CreatorUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrop = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Supabase
      const imageUrl = await uploadCreatorImage(file, creatorId);

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Update creator record with image URL
      const { error } = await supabase
        .from('creators')
        .update({ image_url: imageUrl })
        .eq('id', creatorId);

      if (error) {
        throw error;
      }

      onUploadComplete?.(imageUrl);
    } catch (error) {
      console.error('Error uploading creator image:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload image');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dropzone
      onDrop={handleDrop}
      isUploading={isUploading}
      preview={preview || undefined}
      className={className}
    />
  );
}; 