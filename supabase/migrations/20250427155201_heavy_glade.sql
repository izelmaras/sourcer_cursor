/*
  # Add location content type support

  1. Changes
    - Add location-specific columns to atoms table
    - Add location type to content_type check constraint
*/

-- Add location-specific columns to atoms table
ALTER TABLE atoms
ADD COLUMN IF NOT EXISTS location_latitude numeric,
ADD COLUMN IF NOT EXISTS location_longitude numeric,
ADD COLUMN IF NOT EXISTS location_address text;