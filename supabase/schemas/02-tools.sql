create table tools (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  server_id uuid not null references servers(id) on delete cascade,
  name text not null
);

alter table "tools"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security#policies
create policy "Users can view their own tools."
on tools for select
using ( (select auth.uid()) = user_id );

-- https://supabase.com/docs/guides/database/postgres/row-level-security#insert-policies
create policy "Users can create a tool."
on tools for insert
to authenticated
with check ( (select auth.uid()) = user_id );