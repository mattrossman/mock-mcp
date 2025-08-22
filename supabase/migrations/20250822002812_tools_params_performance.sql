drop policy "Users can create a parameter." on "public"."parameters";

drop policy "Users can delete their own parameters." on "public"."parameters";

drop policy "Users can update their own parameters." on "public"."parameters";

drop policy "Users can view their own parameters." on "public"."parameters";

drop policy "Users can create a tool." on "public"."tools";

drop policy "Users can delete their own tools." on "public"."tools";

drop policy "Users can update their own tools." on "public"."tools";

drop policy "Users can view their own tools." on "public"."tools";


  create policy "Users can create a parameter."
  on "public"."parameters"
  as permissive
  for insert
  to authenticated
with check ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))));



  create policy "Users can delete their own parameters."
  on "public"."parameters"
  as permissive
  for delete
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))));



  create policy "Users can update their own parameters."
  on "public"."parameters"
  as permissive
  for update
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))))
with check ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))));



  create policy "Users can view their own parameters."
  on "public"."parameters"
  as permissive
  for select
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))));



  create policy "Users can create a tool."
  on "public"."tools"
  as permissive
  for insert
  to authenticated
with check ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (( SELECT auth.uid() AS uid) = servers.user_id))));



  create policy "Users can delete their own tools."
  on "public"."tools"
  as permissive
  for delete
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (( SELECT auth.uid() AS uid) = servers.user_id))));



  create policy "Users can update their own tools."
  on "public"."tools"
  as permissive
  for update
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (( SELECT auth.uid() AS uid) = servers.user_id))))
with check ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (( SELECT auth.uid() AS uid) = servers.user_id))));



  create policy "Users can view their own tools."
  on "public"."tools"
  as permissive
  for select
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (( SELECT auth.uid() AS uid) = servers.user_id))));



