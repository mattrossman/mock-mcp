drop policy "Users can delete a server." on "public"."servers";


  create policy "Users can delete their own parameters."
  on "public"."parameters"
  as permissive
  for delete
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (servers.user_id = auth.uid()))))));



  create policy "Users can update their own parameters."
  on "public"."parameters"
  as permissive
  for update
  to authenticated
using ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (servers.user_id = auth.uid()))))))
with check ((tool_id IN ( SELECT tools.id
   FROM tools
  WHERE (tools.server_id IN ( SELECT servers.id
           FROM servers
          WHERE (servers.user_id = auth.uid()))))));



  create policy "Users can delete their own server."
  on "public"."servers"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can update their own servers."
  on "public"."servers"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can delete their own tools."
  on "public"."tools"
  as permissive
  for delete
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (servers.user_id = auth.uid()))));



  create policy "Users can update their own tools."
  on "public"."tools"
  as permissive
  for update
  to authenticated
using ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (servers.user_id = auth.uid()))))
with check ((server_id IN ( SELECT servers.id
   FROM servers
  WHERE (servers.user_id = auth.uid()))));



