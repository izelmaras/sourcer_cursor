/*
  # Enable Row Level Security

  1. Security Changes
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where needed

  2. Tables Modified
    - atoms
    - categories
    - creators
    - tags
*/

-- Enable RLS on all tables
ALTER TABLE atoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Atoms policies
CREATE POLICY "Public atoms are viewable by everyone"
ON atoms FOR SELECT
USING (true);

CREATE POLICY "Users can insert atoms"
ON atoms FOR INSERT
WITH CHECK (true);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Users can insert categories"
ON categories FOR INSERT
WITH CHECK (true);

-- Creators policies
CREATE POLICY "Creators are viewable by everyone"
ON creators FOR SELECT
USING (true);

CREATE POLICY "Users can insert creators"
ON creators FOR INSERT
WITH CHECK (true);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Users can insert tags"
ON tags FOR INSERT
WITH CHECK (true);