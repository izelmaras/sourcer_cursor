/*
  # Update creators table structure

  1. Changes
    - Remove existing portfolio_links column
    - Add three separate link columns for better organization
*/

-- Update creators table to support multiple links
ALTER TABLE creators
DROP COLUMN IF EXISTS portfolio_links;

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS link_1 text,
ADD COLUMN IF NOT EXISTS link_2 text,
ADD COLUMN IF NOT EXISTS link_3 text;