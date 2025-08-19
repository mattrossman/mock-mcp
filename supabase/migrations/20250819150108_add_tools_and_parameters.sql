
  create table "public"."parameters" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "tool_id" uuid not null,
    "name" text not null
      );


alter table "public"."parameters" enable row level security;


  create table "public"."tools" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "server_id" uuid not null,
    "name" text not null
      );


alter table "public"."tools" enable row level security;

CREATE UNIQUE INDEX parameters_pkey ON public.parameters USING btree (id);

CREATE UNIQUE INDEX tools_pkey ON public.tools USING btree (id);

alter table "public"."parameters" add constraint "parameters_pkey" PRIMARY KEY using index "parameters_pkey";

alter table "public"."tools" add constraint "tools_pkey" PRIMARY KEY using index "tools_pkey";

alter table "public"."parameters" add constraint "parameters_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE not valid;

alter table "public"."parameters" validate constraint "parameters_tool_id_fkey";

alter table "public"."parameters" add constraint "parameters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."parameters" validate constraint "parameters_user_id_fkey";

alter table "public"."tools" add constraint "tools_server_id_fkey" FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE not valid;

alter table "public"."tools" validate constraint "tools_server_id_fkey";

alter table "public"."tools" add constraint "tools_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tools" validate constraint "tools_user_id_fkey";

grant delete on table "public"."parameters" to "anon";

grant insert on table "public"."parameters" to "anon";

grant references on table "public"."parameters" to "anon";

grant select on table "public"."parameters" to "anon";

grant trigger on table "public"."parameters" to "anon";

grant truncate on table "public"."parameters" to "anon";

grant update on table "public"."parameters" to "anon";

grant delete on table "public"."parameters" to "authenticated";

grant insert on table "public"."parameters" to "authenticated";

grant references on table "public"."parameters" to "authenticated";

grant select on table "public"."parameters" to "authenticated";

grant trigger on table "public"."parameters" to "authenticated";

grant truncate on table "public"."parameters" to "authenticated";

grant update on table "public"."parameters" to "authenticated";

grant delete on table "public"."parameters" to "service_role";

grant insert on table "public"."parameters" to "service_role";

grant references on table "public"."parameters" to "service_role";

grant select on table "public"."parameters" to "service_role";

grant trigger on table "public"."parameters" to "service_role";

grant truncate on table "public"."parameters" to "service_role";

grant update on table "public"."parameters" to "service_role";

grant delete on table "public"."tools" to "anon";

grant insert on table "public"."tools" to "anon";

grant references on table "public"."tools" to "anon";

grant select on table "public"."tools" to "anon";

grant trigger on table "public"."tools" to "anon";

grant truncate on table "public"."tools" to "anon";

grant update on table "public"."tools" to "anon";

grant delete on table "public"."tools" to "authenticated";

grant insert on table "public"."tools" to "authenticated";

grant references on table "public"."tools" to "authenticated";

grant select on table "public"."tools" to "authenticated";

grant trigger on table "public"."tools" to "authenticated";

grant truncate on table "public"."tools" to "authenticated";

grant update on table "public"."tools" to "authenticated";

grant delete on table "public"."tools" to "service_role";

grant insert on table "public"."tools" to "service_role";

grant references on table "public"."tools" to "service_role";

grant select on table "public"."tools" to "service_role";

grant trigger on table "public"."tools" to "service_role";

grant truncate on table "public"."tools" to "service_role";

grant update on table "public"."tools" to "service_role";


  create policy "Users can create a parameter."
  on "public"."parameters"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can view their own parameters."
  on "public"."parameters"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can create a tool."
  on "public"."tools"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can view their own tools."
  on "public"."tools"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



