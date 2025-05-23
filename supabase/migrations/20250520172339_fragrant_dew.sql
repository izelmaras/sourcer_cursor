/*
  # Add flag for potential deletion
  
  1. Changes
    - Add flag_for_deletion column to atoms table
    - Set default value to false
    - Update existing rows
*/

ALTER TABLE atoms
ADD COLUMN flag_for_deletion boolean DEFAULT false;

UPDATE atoms
SET flag_for_deletion = false
WHERE flag_for_deletion IS NULL;