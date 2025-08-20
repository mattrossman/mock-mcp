create table tools (
  id uuid primary key default uuid_generate_v4(),
  server_id uuid not null references servers(id) on delete cascade,
  name text not null,
  description text not null default ''
);

alter table "tools"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security

create policy "Users can view their own tools."
on tools for select
to authenticated
using (
  server_id in (
    select id
    from servers
    where user_id = auth.uid()
  )
);

create policy "Users can create a tool."
on tools for insert
to authenticated
with check (
  server_id in (
    select id
    from servers
    where user_id = auth.uid()
  )
);

create policy "Users can update their own tools."
on tools for update
to authenticated
using (
  server_id in (
    select id
    from servers
    where user_id = auth.uid()
  )
)
with check (
  server_id in (
    select id
    from servers
    where user_id = auth.uid()
  )
);

create policy "Users can delete their own tools."
on tools for delete
to authenticated
using (
  server_id in (
    select id
    from servers
    where user_id = auth.uid()
  )
);