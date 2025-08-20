"use client"

import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Link, Plus } from "lucide-react"
import { Database } from "../../database.types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
        <CopyButton
          label="Copy URL"
          variant="outline"
          defaultIcon={<Link />}
          text={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mock/mcp?serverId=${server.id}`}
        />
        <Button variant="outline">Edit</Button>
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
