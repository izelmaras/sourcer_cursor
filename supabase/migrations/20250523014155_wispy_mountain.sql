/*
  # Check and optimize storage bucket
  
  1. Changes
    - Verify storage bucket exists and is public
    - Add size limit monitoring
    - Enable file size limits
*/

-- Check if bucket exists and create if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'atoms'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'atoms',
      'atoms',
      true,
      52428800, -- 50MB limit per file
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
  ELSE
    -- Update existing bucket with limits
    UPDATE storage.buckets
    SET 
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    WHERE id = 'atoms';
  END IF;
END $$;

-- Create function to check storage usage
CREATE OR REPLACE FUNCTION check_storage_usage()
RETURNS trigger AS $$
BEGIN
  -- Get total storage size
  WITH storage_size AS (
    SELECT SUM(OCTET_LENGTH(storage.objects.content)) as total_size
    FROM storage.objects
    WHERE bucket_id = 'atoms'
  )
  SELECT
    CASE
      WHEN total_size > 524288000 -- 500MB warning threshold
      THEN raise_warning 'Storage usage exceeds 500MB'
      ELSE NULL
    END
  FROM storage_size;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to monitor storage usage
DROP TRIGGER IF EXISTS check_storage_usage_trigger ON storage.objects;
CREATE TRIGGER check_storage_usage_trigger
AFTER INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION check_storage_usage();