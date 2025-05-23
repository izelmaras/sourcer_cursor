/*
  # Set up storage for creator uploads

  1. Storage Changes
    - Create storage bucket for creators
    - Enable public access for the bucket
    - Add RLS policies for storage access
*/

-- Create storage bucket for creators
INSERT INTO storage.buckets (id, name, public)
VALUES ('creators', 'creators', true);

-- Create RLS policy to allow public read access
CREATE POLICY "Public Access Creators"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creators');

-- Create RLS policy to allow authenticated uploads
CREATE POLICY "Allow Creator Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'creators');

-- Create RLS policy to allow authenticated updates
CREATE POLICY "Allow Creator Updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'creators')
WITH CHECK (bucket_id = 'creators'); 