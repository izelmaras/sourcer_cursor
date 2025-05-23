/*
  # Update tag categorization system

  1. Changes
    - Remove category_id from tags table as tags can now belong to multiple categories
    - Ensure category_tags table has proper constraints and policies
    - Add indexes for better query performance

  2. Security
    - Enable RLS on category_tags table
    - Add policies for public access
*/

-- Remove the category_id column from tags as we'll use the junction table exclusively
ALTER TABLE tags DROP COLUMN IF EXISTS category_id;

-- Ensure category_tags table has proper indexes
CREATE INDEX IF NOT EXISTS idx_category_tags_tag_id ON category_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_category_tags_category_id ON category_tags(category_id);

-- Enable RLS on category_tags
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;

-- Add policies for category_tags
CREATE POLICY "Category tags are viewable by everyone"
ON category_tags
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage category tags"
ON category_tags
FOR ALL
TO public
USING (true)
WITH CHECK (true);