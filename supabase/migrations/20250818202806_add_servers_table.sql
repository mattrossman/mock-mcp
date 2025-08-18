
  create table "public"."servers" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "name" text not null
      );


alter table "public"."servers" enable row level security;

CREATE UNIQUE INDEX servers_pkey ON public.servers USING btree (id);

alter table "public"."servers" add constraint "servers_pkey" PRIMARY KEY using index "servers_pkey";

alter table "public"."servers" add constraint "servers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."servers" validate constraint "servers_user_id_fkey";

grant delete on table "public"."servers" to "anon";

grant insert on table "public"."servers" to "anon";

grant references on table "public"."servers" to "anon";

grant select on table "public"."servers" to "anon";

grant trigger on table "public"."servers" to "anon";

grant truncate on table "public"."servers" to "anon";

grant update on table "public"."servers" to "anon";

grant delete on table "public"."servers" to "authenticated";

grant insert on table "public"."servers" to "authenticated";

grant references on table "public"."servers" to "authenticated";

grant select on table "public"."servers" to "authenticated";

grant trigger on table "public"."servers" to "authenticated";

grant truncate on table "public"."servers" to "authenticated";

grant update on table "public"."servers" to "authenticated";

grant delete on table "public"."servers" to "service_role";

grant insert on table "public"."servers" to "service_role";

grant references on table "public"."servers" to "service_role";

grant select on table "public"."servers" to "service_role";

grant trigger on table "public"."servers" to "service_role";

grant truncate on table "public"."servers" to "service_role";

grant update on table "public"."servers" to "service_role";


  create policy "Users can create a server."
  on "public"."servers"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can view their own servers."
  on "public"."servers"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



