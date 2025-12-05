/*
  # Add hidden field to atoms table
  
  1. Changes
    - Add hidden column to atoms table
    - Set default value to false
    - Update existing rows to false
*/

ALTER TABLE atoms
ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

UPDATE atoms
SET hidden = false
WHERE hidden IS NULL;






