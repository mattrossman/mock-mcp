// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "@supabase/supabase-js";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import type { Database } from "@/database.types.ts";

const FUNCTION_NAME = "mock";

Deno.serve(async (req) => {
  // Configure Supabase client

  const authorization = req.headers.get("Authorization");
  if (authorization === null) {
    return new Response(`Missing "Authorization" header`, { status: 401 });
  }

  const client = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authorization },
      },
    },
  );

  // Authenticate user

  const $user = await client.auth.getUser();

  if ($user.data === null || $user.error !== null) {
    const message = $user.error?.message ?? "Unauthorized";
    return new Response(message, {
      status: 401,
    });
  }

  const userId = $user.data.user.id;

  const $servers = await client.from("servers").select("name, id").eq(
    "user_id",
    userId,
  );

  if ($servers.error) {
    throw new Error($servers.error.message);
  }

  // Configure MCP server

  const handler = createMcpHandler(
    (server) => {
      server.tool(
        "get_email",
        "Gets the email of the authenticated user",
        {},
        () => {
          return {
            content: [{
              type: "text",
              text: `${$user.data.user.email ?? "(missing email)"}`,
            }],
          };
        },
      );

      server.tool(
        "get_servers",
        "Gets the mock servers configured by the authenticated user",
        {},
        () => {
          return {
            content: [{
              type: "text",
              text: `${JSON.stringify($servers.data)}`,
            }],
          };
        },
      );

      // TODO: Dynamically add tools from DB
    },
    {},
    {
      basePath: `/${FUNCTION_NAME}`,
      disableSse: true,
    },
  );

  return await handler(req);
});
