// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "@supabase/supabase-js";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const authorization = req.headers.get("Authorization");
  if (authorization === null) {
    return new Response("Unauthorized", { status: 401 });
  }

  const accessToken = authorization.split(" ").at(1);
  if (accessToken === null) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authorization },
      },
    },
  );

  const { data, error } = await supabaseClient.auth.getClaims(accessToken, {
    allowExpired: true,
  });

  if (data === null || error !== null) {
    console.log(error?.message);
    const message = error?.message ?? "Unauthorized";
    return new Response(message, {
      status: 401,
    });
  }

  const email: string = data.claims["email"];

  const responseData = {
    message: `Hello ${email}`,
  };

  return new Response(
    JSON.stringify(responseData),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-jwt' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
