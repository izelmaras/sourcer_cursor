/*
  # Add performance indexes for creator tags
  
  1. Changes
    - Add indexes on creator_id and tag_id columns
    - Improve query performance for creator tag lookups
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creator_tags_creator_id ON creator_tags(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_tags_tag_id ON creator_tags(tag_id);