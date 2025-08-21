export function getServerUrl(serverId: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/server/${serverId}/mcp`;
}
