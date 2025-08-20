create type "public"."parameter_type" as enum ('string', 'number');

alter table "public"."parameters" add column "description" text not null;

alter table "public"."parameters" add column "type" parameter_type not null;


