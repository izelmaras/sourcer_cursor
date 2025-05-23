-- Update bucket configuration with proper MIME types and handling
UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ],
  file_size_limit = 52428800 -- 50MB limit
WHERE id = 'atoms';

-- Ensure proper content type handling
ALTER TABLE storage.objects
  ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb;

-- Add content type validation trigger
CREATE OR REPLACE FUNCTION validate_content_type()
RETURNS trigger AS $$
BEGIN
  IF NEW.metadata->>'mimetype' IS NULL THEN
    RAISE EXCEPTION 'Content type is required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_content_type_trigger ON storage.objects;
CREATE TRIGGER validate_content_type_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION validate_content_type();