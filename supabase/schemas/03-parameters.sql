create table parameters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  tool_id uuid not null references tools(id) on delete cascade,
  name text not null
);

alter table "parameters"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security#policies
create policy "Users can view their own parameters."
on parameters for select
using ( (select auth.uid()) = user_id );

-- https://supabase.com/docs/guides/database/postgres/row-level-security#insert-policies
create policy "Users can create a parameter."
on parameters for insert
to authenticated
with check ( (select auth.uid()) = user_id );