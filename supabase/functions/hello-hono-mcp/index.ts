// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { z } from "zod";

// change this to your function name
const functionName = "hello-hono-mcp";
const app = new Hono().basePath(`/${functionName}`);

// Your MCP server implementation
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

// Add an addition tool
server.registerTool("add", {
  title: "Addition Tool",
  description: "Add two numbers",
  inputSchema: { a: z.number(), b: z.number() },
}, ({ a, b }) => ({
  content: [{ type: "text", text: String(a + b) }],
}));

app.all("/mcp", async (c) => {
  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

Deno.serve(app.fetch);
