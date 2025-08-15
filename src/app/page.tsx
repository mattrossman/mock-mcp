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

  return (
    <div className="grid w-full gap-2">
      <div className="flex gap-2 items-center">
        <p>
          Hello <span>{data.claims.email}</span>
        </p>
        <LogoutButton />
      </div>
      <div className="max-w-xl">
        <CodeBlock
          code={session.data.session?.access_token ?? ""}
          label="access_token"
        />
      </div>
    </div>
  )
}
