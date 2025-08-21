// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "@supabase/supabase-js";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import dedent from "dedent";

import type { Database } from "@/database.types.ts";

const FUNCTION_NAME = "server";

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
  const serverId = url.pathname.split("/").at(2);

  if (serverId === undefined) {
    return new Response(`Missing "serverId" in path`, { status: 400 });
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
          async (params) => {
            // Simulate a mock response
            const { text } = await generateText({
              model: openai("gpt-4o"),
              system: dedent`
                You are a mock MCP server (though you shouldn't reference this in your response).
                You receive a tool call, and you must compute a reasonable return value exactly as if you were a computer program implementation.
                Usually this will be plain text, but it could contain JSON.
              `,
              prompt: JSON.stringify({
                server_name: $server.data.name,
                tool_name: tool.name,
                tool_description: tool.description,
                tool_parameters: tool.parameters.map((parameter) => {
                  const value = params[parameter.name];
                  return {
                    name: parameter.name,
                    description: parameter.description,
                    value,
                  };
                }),
              }),
            });

            return {
              content: [{
                type: "text",
                text,
              }],
            };
          },
        );
      }
    },
    {},
    {
      basePath: `/${FUNCTION_NAME}/${serverId}`,
      disableSse: true,
    },
  );

  return await handler(req);
});
