/*
  # Add favorite creators setting
  
  1. Changes
    - Add favorite_creators setting to settings table
    - This setting stores an array of creator names that the user has favorited
    - Uses existing settings table (no schema changes needed)
*/

-- Note: The settings table already exists from previous migrations
-- This migration documents the favorite_creators setting usage
-- The setting will be stored as: { "creatorNames": ["Creator 1", "Creator 2", ...] }


