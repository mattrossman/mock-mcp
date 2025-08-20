import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/code-block"
import { Button } from "@/components/ui/button"
import { getServerUrl } from "@/lib/get-server-url"
import { createClient } from "@/lib/supabase/server"

export default async function Page({
  params,
}: {
  params: { serverId: string }
}) {
  const client = await createClient()

  const { serverId } = await params

  const $server = await client
    .from("servers")
    .select("*")
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

        <h1 className="text-2xl font-bold mb-10 grow">{server.name}</h1>

        <CodeBlock label="URL" code={getServerUrl(server.id)} />

        <section className="mt-10">
          <h1 className="text-2xl font-bold mb-10">Tools</h1>
        </section>
      </header>
    </div>
  )
}
