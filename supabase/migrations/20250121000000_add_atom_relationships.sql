/*
  # Add atom relationships for hierarchical structure
  
  1. Changes
    - Create atom_relationships table for parent-child relationships between atoms
    - Allows ideas (and other atoms) to contain other atoms
    - Add indexes for performance
*/

create table if not exists atom_relationships (
  id serial primary key,
  parent_atom_id integer references atoms(id) on delete cascade,
  child_atom_id integer references atoms(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  constraint no_self_reference check (parent_atom_id != child_atom_id),
  constraint unique_relationship unique (parent_atom_id, child_atom_id)
);

create index if not exists atom_relationships_parent_idx on atom_relationships(parent_atom_id);
create index if not exists atom_relationships_child_idx on atom_relationships(child_atom_id);

-- Enable RLS
ALTER TABLE atom_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for atom_relationships
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
