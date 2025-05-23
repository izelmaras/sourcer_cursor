/*
  # Add management policies for tables

  1. Security Changes
    - Add management policies (insert, update, delete) for tags, categories, and creators
*/

-- Add management policies
CREATE POLICY "Users can manage tags"
ON tags
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can manage categories"
ON categories
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can manage creators"
ON creators
FOR ALL
TO public
USING (true)
WITH CHECK (true);