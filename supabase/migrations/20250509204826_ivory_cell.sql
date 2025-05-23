/*
  # Enable RLS and add policies for creator_tags table

  1. Security Changes
    - Enable RLS on creator_tags table
    - Add policies for:
      - Public read access to all creator tags
      - Public insert access for creator tags
      - Public management (all operations) for creator tags

  2. Notes
    - Allows public access to maintain consistency with other tables
    - Enables full CRUD operations through RLS policies
*/

-- Enable RLS on creator_tags table
ALTER TABLE creator_tags ENABLE ROW LEVEL SECURITY;

-- Add policies for creator_tags table
CREATE POLICY "Creator tags are viewable by everyone"
  ON creator_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert creator tags"
  ON creator_tags
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can manage creator tags"
  ON creator_tags
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);