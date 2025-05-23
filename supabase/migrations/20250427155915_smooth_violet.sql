/*
  # Enable RLS for atoms table

  1. Security Changes
    - Enable RLS on atoms table
    - Add policy for public read access
    - Add policy for public write access
*/

-- Enable RLS
ALTER TABLE atoms ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Atoms are viewable by everyone"
ON atoms
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage atoms"
ON atoms
FOR ALL
TO public
USING (true)
WITH CHECK (true);