create table parameters (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid not null references tools(id) on delete cascade,
  name text not null
);

alter table "parameters"
enable row level security;

-- https://supabase.com/docs/guides/database/postgres/row-level-security

create policy "Users can view their own parameters."
on parameters for select
to authenticated
using (
  tool_id in (
    select id
    from tools
    where server_id in (
      select id
      from servers
      where user_id = auth.uid()
    )
  )
);

create policy "Users can create a parameter."
on parameters for insert
to authenticated
with check (
  tool_id in (
    select id
    from tools
    where server_id in (
      select id
      from servers
      where user_id = auth.uid()
    )
  )
);

create policy "Users can update their own parameters."
on parameters for update
to authenticated
using (
  tool_id in (
    select id
    from tools
    where server_id in (
      select id
      from servers
      where user_id = auth.uid()
    )
  )
)
with check (
  tool_id in (
    select id
    from tools
    where server_id in (
      select id
      from servers
      where user_id = auth.uid()
    )
  )
);

create policy "Users can delete their own parameters."
on parameters for delete
to authenticated
using (
  tool_id in (
    select id
    from tools
    where server_id in (
      select id
      from servers
      where user_id = auth.uid()
    )
  )
);