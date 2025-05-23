/*
  # Add image_url field to creators table
*/

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS image_url text; 