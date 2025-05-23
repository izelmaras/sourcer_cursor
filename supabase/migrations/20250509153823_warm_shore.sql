/*
  # Fix private functionality policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate policies with proper conditions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hide private tags" ON tags;
DROP POLICY IF EXISTS "Hide private categories" ON categories;

-- Recreate policies with proper conditions
CREATE POLICY "Hide private tags"
ON tags
FOR SELECT
TO public
USING (is_private = false OR private_password IS NOT NULL);

CREATE POLICY "Hide private categories"
ON categories
FOR SELECT
TO public
USING (is_private = false OR private_password IS NOT NULL);