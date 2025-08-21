import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ToolSection, ConnectButton } from "@/app/[serverId]/client"

export default async function ServerPage({
  params,
}: {
  params: Promise<{ serverId: string }>
}) {
  const client = await createClient()

  const { serverId } = await params

  // Get user session for access token
  const $session = await client.auth.getSession()
  const accessToken = $session.data.session?.access_token

  if (!accessToken) {
    redirect("/auth/login")
  }

  const $server = await client
    .from("servers")
    .select("*, tools(*, parameters(*))")
    .eq("id", serverId)
    .single()

  if ($server.data === null) {
    return notFound()
  }

  const server = $server.data

  return (
    <div className="py-20">
      <header className="relative">
        <div className="absolute bottom-full -left-6 pb-4">
          <Button asChild variant="ghost">
            <Link href="/">
              <span className="flex items-center gap-2">
                <ChevronLeft />
                Servers
              </span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold grow">{server.name}</h1>
          <ConnectButton serverId={server.id} accessToken={accessToken} />
        </div>
      </header>

      <ToolSection serverId={server.id} tools={server.tools} />
    </div>
  )
}
