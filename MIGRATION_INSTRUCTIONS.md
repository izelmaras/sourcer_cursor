# Database Migration Required

## Issue
The `atom_relationships` table does not exist in your Supabase database, which is causing 404 errors when trying to fetch or create atom relationships.

## Solution
You need to run the migration file to create the table.

### Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250121000000_add_atom_relationships.sql`
4. Click **Run** to execute the migration

### Option 2: Run via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or manually:

```bash
supabase migration up
```

### Option 3: Run SQL Directly

Copy this SQL and run it in your Supabase SQL Editor:

```sql
create table if not exists atom_relationships (
  id serial primary key,
  parent_atom_id integer references atoms(id) on delete cascade,
  child_atom_id integer references atoms(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  constraint no_self_reference check (parent_atom_id != child_atom_id),
  constraint unique_relationship unique (parent_atom_id, child_atom_id)
);

create index if not exists atom_relationships_parent_idx on atom_relationships(parent_atom_id);
create index if not exists atom_relationships_child_idx on atom_relationships(child_atom_id);
```

## Verification

After running the migration, verify the table exists:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see `atom_relationships` table listed
3. The table should have columns: `id`, `parent_atom_id`, `child_atom_id`, `created_at`

## What This Migration Does

- Creates the `atom_relationships` table for parent-child relationships between atoms
- Allows ideas (and other atoms) to contain other atoms
- Adds indexes for performance
- Prevents self-references and duplicate relationships












