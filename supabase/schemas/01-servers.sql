create table servers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table "servers"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security

create policy "Users can view their own servers."
on servers for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Users can create a server."
on servers for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can update their own servers."
on servers for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own server."
on servers for delete
to authenticated 
using ( (select auth.uid()) = user_id );