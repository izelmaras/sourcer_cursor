/*
  # Add private items support
  
  1. Changes
    - Add is_private column to tags and categories tables
    - Add private_password column to store hashed passwords
    - Add RLS policies for private items
*/

-- Add is_private column to tags
ALTER TABLE tags
ADD COLUMN is_private boolean DEFAULT false,
ADD COLUMN private_password text;

-- Add is_private column to categories  
ALTER TABLE categories
ADD COLUMN is_private boolean DEFAULT false,
ADD COLUMN private_password text;

-- Update RLS policies to handle private items
CREATE POLICY "Hide private tags"
ON tags
FOR SELECT
TO public
USING (is_private = false);

CREATE POLICY "Hide private categories"
ON categories
FOR SELECT
TO public
USING (is_private = false);