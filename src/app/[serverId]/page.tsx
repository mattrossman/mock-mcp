import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: { serverId: string }
}) {
  const client = await createClient()

  const $server = await client
    .from("servers")
    .select("*")
    .eq("id", params.serverId)
    .single()

  if ($server.data === null) {
    return notFound()
  }

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

        <h1 className="text-2xl font-bold mb-10 grow">{$server.data.name}</h1>
      </header>
    </div>
  )
}
