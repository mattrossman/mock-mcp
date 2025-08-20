import { redirect } from "next/navigation"

import { AddServerButton, ServerCard } from "@/app/client"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  const $servers = await supabase
    .from("servers")
    .select("*")
    .eq("user_id", data.claims.sub)

  const renderServers = () => {
    if ($servers.error) {
      return <p>Error loading servers: {$servers.error.message}</p>
    }

    if ($servers.data.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          Add a server to get started
        </p>
      )
    }

    return (
      <ul className="grid gap-4">
        {$servers.data.map((server) => (
          <li key={server.id}>
            <ServerCard server={server} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="py-12">
      <header className="flex">
        <h1 className="text-2xl font-bold mb-10 grow">Servers</h1>
        <AddServerButton />
      </header>

      {renderServers()}
    </div>
  )
}
