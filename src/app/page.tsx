import { redirect } from "next/navigation"

import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { CodeBlock } from "@/components/code-block"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  const session = await supabase.auth.getSession()

  const userId = session.data.session?.user.id
  if (userId === undefined) throw new Error("User ID is undefined")

  const $servers = await supabase
    .from("servers")
    .select("*")
    .eq("user_id", userId)

  return (
    <div className="grid w-full gap-2">
      <div className="max-w-xl">
        <CodeBlock
          code={session.data.session?.access_token ?? ""}
          label="access_token"
        />
        <h2>Servers</h2>
        {$servers.data?.map((server) => (
          <CodeBlock
            key={server.id}
            code={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mock/mcp?serverId=${server.id}`}
            label={server.name}
          />
        ))}
      </div>
    </div>
  )
}
