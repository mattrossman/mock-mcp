alter type "public"."parameter_type" rename to "parameter_type__old_version_to_be_dropped";

create type "public"."parameter_type" as enum ('string', 'number', 'boolean');

alter table "public"."parameters" alter column type type "public"."parameter_type" using type::text::"public"."parameter_type";

drop type "public"."parameter_type__old_version_to_be_dropped";


