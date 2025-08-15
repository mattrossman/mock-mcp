// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from "hono";

// change this to your function name
const functionName = "hello-hono";
const app = new Hono().basePath(`/${functionName}`);

app.get("/", (c) => c.text("Hello from hono-server!"));

Deno.serve(app.fetch);
