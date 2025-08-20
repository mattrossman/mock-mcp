alter table "public"."servers" alter column "user_id" set default auth.uid();


  create policy "Users can delete a server."
  on "public"."servers"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



