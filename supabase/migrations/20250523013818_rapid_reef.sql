/*
  # Update storage policies
  
  1. Changes
    - Add storage policies for public access
    - Handle case where bucket already exists
*/

DO $$
BEGIN
  -- Create storage bucket for atoms if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'atoms'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('atoms', 'atoms', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;

-- Create RLS policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'atoms');

-- Create RLS policy to allow public uploads
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'atoms');

-- Create RLS policy to allow public updates
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'atoms');

-- Create RLS policy to allow public deletes
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'atoms');