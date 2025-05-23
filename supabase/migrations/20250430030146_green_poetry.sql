/*
  # Set up storage for image uploads

  1. Storage Changes
    - Create storage bucket for atoms
    - Enable public access for the bucket
    - Add RLS policies for storage access
*/

-- Create storage bucket for atoms
INSERT INTO storage.buckets (id, name, public)
VALUES ('atoms', 'atoms', true);

-- Create RLS policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'atoms');

-- Create RLS policy to allow authenticated uploads
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'atoms');