-- Fix RLS policies for atom_relationships table
-- Run this in your Supabase SQL Editor if the table already exists

-- Enable RLS (if not already enabled)
ALTER TABLE atom_relationships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Atom relationships are viewable by everyone" ON atom_relationships;
DROP POLICY IF EXISTS "Users can insert atom relationships" ON atom_relationships;
DROP POLICY IF EXISTS "Users can update atom relationships" ON atom_relationships;
DROP POLICY IF EXISTS "Users can delete atom relationships" ON atom_relationships;

-- Create RLS Policies for atom_relationships
CREATE POLICY "Atom relationships are viewable by everyone"
ON atom_relationships FOR SELECT
USING (true);

CREATE POLICY "Users can insert atom relationships"
ON atom_relationships FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update atom relationships"
ON atom_relationships FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete atom relationships"
ON atom_relationships FOR DELETE
USING (true);



