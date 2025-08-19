drop policy "Users can create a parameter." on "public"."parameters";

drop policy "Users can view their own parameters." on "public"."parameters";

drop policy "Users can create a server." on "public"."servers";

drop policy "Users can view their own servers." on "public"."servers";

drop policy "Users can create a tool." on "public"."tools";

drop policy "Users can view their own tools." on "public"."tools";

alter table "public"."parameters" drop constraint "parameters_user_id_fkey";

alter table "public"."tools" drop constraint "tools_user_id_fkey";

alter table "public"."parameters" drop column "user_id";

alter table "public"."tools" drop column "user_id";


  create policy "Users can create a parameter."
  on "public"."parameters"
  as permissive
  for insert
  to authenticated
with check ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (servers.user_id = auth.uid()))))));



  create policy "Users can view their own parameters."
  on "public"."parameters"
  as permissive
  for select
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (servers.user_id = auth.uid()))))));



  create policy "Users can create a server."
  on "public"."servers"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can view their own servers."
  on "public"."servers"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can create a tool."
  on "public"."tools"
  as permissive
  for insert
  to authenticated
with check ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (servers.user_id = auth.uid()))));



  create policy "Users can view their own tools."
  on "public"."tools"
  as permissive
  for select
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (servers.user_id = auth.uid()))));



