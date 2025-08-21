"use client"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { createClient } from "@/lib/supabase/client"
import { Database } from "../../database.types"

export function ServerCard({
  server,
}: {
  server: Database["public"]["Tables"]["servers"]["Row"]
}) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async (serverId: string) => {
    await supabase.from("servers").delete().eq("id", serverId)
    router.refresh()
  }

  return (
    <div className="bg-card border rounded-md px-6 py-6 flex items-center">
      <span className="grow">{server.name}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/${server.id}`}>Edit</Link>
        </Button>
        <Button variant="destructive" onClick={() => handleDelete(server.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export function AddServerButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleAddServer = async () => {
    await supabase.from("servers").insert({
      name: "New Server",
    })
    router.refresh()
  }

  return (
    <Button className="flex items-center gap-2" onClick={handleAddServer}>
      <Plus />
      Add Server
    </Button>
  )
}
