-- Add default values for is_private
ALTER TABLE tags
ALTER COLUMN is_private SET DEFAULT false;

ALTER TABLE categories
ALTER COLUMN is_private SET DEFAULT false;

-- Update existing rows to have is_private = false
UPDATE tags
SET is_private = false
WHERE is_private IS NULL;

UPDATE categories
SET is_private = false
WHERE is_private IS NULL;