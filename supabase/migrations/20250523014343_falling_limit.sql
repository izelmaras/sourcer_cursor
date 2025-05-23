/*
  # Update storage bucket configuration
  
  1. Changes
    - Update allowed MIME types to include all image formats
    - Add proper content type handling
*/

-- Update bucket configuration with expanded MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
]
WHERE id = 'atoms';