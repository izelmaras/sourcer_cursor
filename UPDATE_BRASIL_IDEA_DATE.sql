-- Update "Going to brasil" idea created_at to September 3, 2025
-- Run this in your Supabase SQL Editor

UPDATE atoms
SET 
  created_at = '2025-09-03 00:00:00'::timestamp,
  updated_at = '2025-09-03 00:00:00'::timestamp
WHERE 
  title = 'Going to brasil' 
  AND content_type = 'idea';

-- Verify the update
SELECT 
  id,
  title,
  content_type,
  created_at,
  updated_at,
  NOW() - created_at as age
FROM atoms
WHERE title = 'Going to brasil' AND content_type = 'idea';

