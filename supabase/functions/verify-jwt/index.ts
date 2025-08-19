// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import type { Database } from "@/database.types.ts";

import { createClient } from "@supabase/supabase-js";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const authorization = req.headers.get("Authorization");
  if (authorization === null) {
    return new Response(`Missing "Authorization" header`, { status: 401 });
  }

  const supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authorization },
      },
    },
  );

  const $user = await supabaseClient.auth.getUser();

  if ($user.data === null || $user.error !== null) {
    const message = $user.error?.message ?? "Unauthorized";
    return new Response(message, {
      status: 401,
    });
  }

  const email = $user.data.user.email ?? "(missing email)";

  const userId = $user.data.user.id;

  const $servers = await supabaseClient.from("servers").select(`
    id,
    name,
    tools (
      id,
      name,
      parameters (
        id,
        name
      )
    )
  `).eq(
    "user_id",
    userId,
  );

  console.log($servers);

  if ($servers.error) {
    throw new Error($servers.error.message);
  }

  const responseData = {
    email: `Hello ${email}`,
    servers: $servers.data,
  };

  return new Response(
    JSON.stringify(responseData),
    { headers: { "Content-Type": "application/json" } },
  );
});
