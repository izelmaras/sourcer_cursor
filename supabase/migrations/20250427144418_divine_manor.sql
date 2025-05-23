/*
  # Add category assignments

  1. New Tables
    - `category_tags`
      - `id` (integer, primary key)
      - `category_id` (integer, foreign key to categories)
      - `tag_id` (integer, foreign key to tags)
      - `created_at` (timestamp with time zone)
    
    - `category_creators`
      - `id` (integer, primary key)
      - `category_id` (integer, foreign key to categories)
      - `creator_id` (integer, foreign key to creators)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

-- Create category_tags table
CREATE TABLE category_tags (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, tag_id)
);

-- Create category_creators table
CREATE TABLE category_creators (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, creator_id)
);

-- Enable RLS
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_creators ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Category tags are viewable by everyone"
ON category_tags FOR SELECT
USING (true);

CREATE POLICY "Users can insert category tags"
ON category_tags FOR INSERT
WITH CHECK (true);

CREATE POLICY "Category creators are viewable by everyone"
ON category_creators FOR SELECT
USING (true);

CREATE POLICY "Users can insert category creators"
ON category_creators FOR INSERT
WITH CHECK (true);