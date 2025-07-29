-- Add prompt field to atoms table
-- This field will store AI generation prompts for image and video content

ALTER TABLE atoms 
ADD COLUMN prompt TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN atoms.prompt IS 'AI generation prompt for image and video content types'; 