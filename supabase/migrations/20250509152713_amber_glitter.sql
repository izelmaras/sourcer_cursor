/*
  # Update privacy policies

  1. Security Changes
    - Drop existing privacy policies
    - Recreate policies with updated conditions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Hide private tags" ON tags;
DROP POLICY IF EXISTS "Hide private categories" ON categories;

-- Recreate policies with updated conditions
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