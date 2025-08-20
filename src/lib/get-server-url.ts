export function getServerUrl(serverId: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mock/mcp?serverId=${serverId}`;
}
