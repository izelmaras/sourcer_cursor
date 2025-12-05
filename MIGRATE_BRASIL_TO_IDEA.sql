-- Migrate all atoms from Brasil category to "Going to brasil" idea
-- Run this in your Supabase SQL Editor

-- Step 1: Find the Brasil category and get its tags
DO $$
DECLARE
  brasil_category_id INTEGER;
  brasil_tag_ids INTEGER[];
  new_idea_id INTEGER;
  atom_count INTEGER;
BEGIN
  -- Find the Brasil category (case-insensitive)
  SELECT id INTO brasil_category_id
  FROM categories
  WHERE LOWER(name) = 'brasil';
  
  IF brasil_category_id IS NULL THEN
    RAISE EXCEPTION 'Brasil category not found. Please check the category name.';
  END IF;
  
  RAISE NOTICE 'Found Brasil category with ID: %', brasil_category_id;
  
  -- Get all tag IDs associated with Brasil category
  SELECT ARRAY_AGG(tag_id) INTO brasil_tag_ids
  FROM category_tags
  WHERE category_id = brasil_category_id;
  
  IF brasil_tag_ids IS NULL OR array_length(brasil_tag_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No tags found for Brasil category';
  END IF;
  
  RAISE NOTICE 'Found % tags in Brasil category', array_length(brasil_tag_ids, 1);
  
  -- Step 2: Create the new idea atom "Going to brasil"
  INSERT INTO atoms (title, content_type, description, created_at, updated_at)
  VALUES ('Going to brasil', 'idea', 'Atoms migrated from Brasil category', NOW(), NOW())
  RETURNING id INTO new_idea_id;
  
  RAISE NOTICE 'Created new idea "Going to brasil" with ID: %', new_idea_id;
  
  -- Step 3: Find all atoms that have any of the Brasil category tags
  -- Atoms have tags stored as a text array, so we check if any tag matches
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
  
  RAISE NOTICE 'Successfully linked % atoms to the new idea "Going to brasil"', atom_count;
  
END $$;

-- Verify the migration
SELECT 
  a.id,
  a.title,
  a.content_type,
  COUNT(ar.child_atom_id) as child_count
FROM atoms a
LEFT JOIN atom_relationships ar ON a.id = ar.parent_atom_id
WHERE a.title = 'Going to brasil'
GROUP BY a.id, a.title, a.content_type;






