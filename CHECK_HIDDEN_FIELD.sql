-- Check if hidden column exists and verify RLS policies
-- Run this in your Supabase SQL Editor

-- 1. Check if the hidden column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'atoms' AND column_name = 'hidden';

-- 2. If the column doesn't exist, add it:
ALTER TABLE atoms
ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

-- 3. Update any NULL values to false
UPDATE atoms
SET hidden = false
WHERE hidden IS NULL;

-- 4. Verify RLS policies allow updates (should already exist)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'atoms' AND cmd IN ('UPDATE', 'ALL');

-- 5. Test: Check a few atoms to see their hidden values
SELECT id, title, hidden
FROM atoms
LIMIT 5;


