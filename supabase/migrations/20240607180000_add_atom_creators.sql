create table if not exists atom_creators (
  id serial primary key,
  atom_id integer references atoms(id) on delete cascade,
  creator_id integer references creators(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create unique index if not exists atom_creators_atom_id_creator_id_idx on atom_creators(atom_id, creator_id);
