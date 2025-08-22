drop policy "Users can create a server." on "public"."servers";

drop policy "Users can delete their own server." on "public"."servers";

drop policy "Users can update their own servers." on "public"."servers";

drop policy "Users can view their own servers." on "public"."servers";


  create policy "Users can create a server."
  on "public"."servers"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can delete their own server."
  on "public"."servers"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can update their own servers."
  on "public"."servers"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can view their own servers."
  on "public"."servers"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



