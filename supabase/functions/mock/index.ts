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

  const authHeader = req.headers.get("Authorization");
  if (authHeader === null) {
    return new Response(`Missing "Authorization" header`, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  const client = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader },
      },
    },
  );

  // Authenticate user

  const $user = await client.auth.getClaims(token, {
    allowExpired: true, // Still validates expiry, but populates `error` channel instead of throwing an exception
  });

  if ($user.data === null || $user.error !== null) {
    const message = $user.error?.message ?? "Unauthorized";
    return new Response(message, {
      status: 401,
    });
  }

  // Parse query params

  const url = new URL(req.url);
  const serverId = url.searchParams.get("serverId");

  if (serverId === null) {
    return new Response(`Missing "serverId" query parameter`, { status: 400 });
  }

  const $server = await client.from("servers").select(
    `*, tools(*, parameters(*))`,
  )
    .eq("id", serverId)
    .single();

  if ($server.error) {
    throw new Error($server.error.message);
  }

  // Configure MCP server

  const handler = createMcpHandler(
    (server) => {
      server.tool(
        "debug",
        "For debugging",
        {
          string: z.string().describe("A string"),
          boolean: z.boolean().describe("A boolean"),
          number: z.number(),
          email: z.string().email(),
          enum: z.enum(["red", "green", "blue"]),
        },
        (params) => {
          return {
            content: [{
              type: "text",
              text: `Mock response for tool "debug" with params: ${
                JSON.stringify(params)
              }`,
            }],
          };
        },
      );

      for (const tool of $server.data.tools) {
        const paramsSchema = Object.fromEntries(
          tool.parameters.map((p) => {
            const schema = z[p.type]();
            const schemaWithDescription = schema.describe(p.description);
            return [p.name, schemaWithDescription];
          }),
        );

        server.tool(
          tool.name,
          tool.description,
          paramsSchema,
          (params) => {
            // Simulate a mock response
            return {
              content: [{
                type: "text",
                text: `Mock response for tool "${tool.name}" with params: ${
                  JSON.stringify(params)
                }`,
              }],
            };
          },
        );
      }
    },
    {},
    {
      basePath: `/${FUNCTION_NAME}`,
      disableSse: true,
    },
  );

  return await handler(req);
});
