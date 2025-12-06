/*
  # Migrate Brasil category atoms to "Going to brasil" idea
  
  1. Changes
    - Find all atoms with tags from "Brasil" category
    - Create a new idea atom called "Going to brasil"
    - Link all those atoms as children of the new idea
*/

-- Step 1: Find the Brasil category ID
DO $$
DECLARE
  brasil_category_id INTEGER;
  brasil_tag_ids INTEGER[];
  new_idea_id INTEGER;
  atom_count INTEGER;
BEGIN
  -- Find the Brasil category
  SELECT id INTO brasil_category_id
  FROM categories
  WHERE LOWER(name) = 'brasil';
  
  IF brasil_category_id IS NULL THEN
    RAISE EXCEPTION 'Brasil category not found';
  END IF;
  
  -- Get all tag IDs associated with Brasil category
  SELECT ARRAY_AGG(tag_id) INTO brasil_tag_ids
  FROM category_tags
  WHERE category_id = brasil_category_id;
  
  IF brasil_tag_ids IS NULL OR array_length(brasil_tag_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No tags found for Brasil category';
  END IF;
  
  -- Step 2: Create the new idea atom "Going to brasil"
  INSERT INTO atoms (title, content_type, description, created_at, updated_at)
  VALUES ('Going to brasil', 'idea', 'Atoms migrated from Brasil category', NOW(), NOW())
  RETURNING id INTO new_idea_id;
  
  RAISE NOTICE 'Created new idea with ID: %', new_idea_id;
  
  -- Step 3: Find all atoms that have any of the Brasil category tags
  -- Atoms have tags stored as a text array, so we need to check if any tag matches
  WITH brasil_tag_names AS (
    SELECT name
    FROM tags
    WHERE id = ANY(brasil_tag_ids)
  ),
  matching_atoms AS (
    SELECT DISTINCT a.id
    FROM atoms a
    WHERE a.tags IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM brasil_tag_names btn
        WHERE btn.name = ANY(a.tags)
      )
      AND a.content_type != 'idea'  -- Don't include other ideas
      AND a.id != new_idea_id  -- Don't include the new idea itself
  )
  -- Step 4: Create relationships for all matching atoms
  INSERT INTO atom_relationships (parent_atom_id, child_atom_id, created_at)
  SELECT new_idea_id, id, NOW()
  FROM matching_atoms
  ON CONFLICT (parent_atom_id, child_atom_id) DO NOTHING;
  
  GET DIAGNOSTICS atom_count = ROW_COUNT;
  
  RAISE NOTICE 'Linked % atoms to the new idea', atom_count;
  
END $$;

