create table servers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null
);

alter table "servers"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security

create policy "Users can view their own servers."
on servers for select
to authenticated
using ( auth.uid() = user_id );

create policy "Users can create a server."
on servers for insert
to authenticated
with check ( auth.uid() = user_id );

create policy "Users can delete a server."
on servers for delete
to authenticated 
using ( auth.uid() = user_id );