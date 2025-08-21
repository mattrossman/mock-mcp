"use client"
import { Plus, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { createClient } from "@/lib/supabase/client"
import { Database } from "../../database.types"

type UpsertServerData = {
  id?: string // Omitted if we're adding a new row
  name: string
}

export function ServerCard({
  server,
}: {
  server: Database["public"]["Tables"]["servers"]["Row"]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [editingServer, setEditingServer] = useState<UpsertServerData>()

  const handleDelete = async (serverId: string) => {
    await supabase.from("servers").delete().eq("id", serverId)
    router.refresh()
  }

  const handleUpsertServer = async (data: UpsertServerData) => {
    await supabase.from("servers").upsert({ ...data })
    router.refresh()
    setEditingServer(undefined)
  }

  const handleRename = () => {
    setEditingServer({
      id: server.id,
      name: server.name,
    })
  }

  return (
    <div className="bg-card border rounded-md px-6 py-6 flex items-center">
      {editingServer && (
        <ServerForm
          defaultValues={editingServer}
          onServerChange={(values) => {
            handleUpsertServer({ id: editingServer.id, ...values })
          }}
          onOpenChange={(open) => {
            if (!open) {
              setEditingServer(undefined)
            }
          }}
        />
      )}

      <span className="grow">{server.name}</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleRename}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${server.id}`}>Manage</Link>
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
  const [editingServer, setEditingServer] = useState<UpsertServerData>()

  const handleUpsertServer = async (data: UpsertServerData) => {
    await supabase.from("servers").insert({ name: data.name })
    router.refresh()
    setEditingServer(undefined)
  }

  const handleAddServer = () => {
    setEditingServer({
      name: "",
    })
  }

  return (
    <>
      {editingServer && (
        <ServerForm
          defaultValues={editingServer}
          onServerChange={(values) => {
            handleUpsertServer(values)
          }}
          onOpenChange={(open) => {
            if (!open) {
              setEditingServer(undefined)
            }
          }}
        />
      )}

      <Button className="flex items-center gap-2" onClick={handleAddServer}>
        <Plus />
        Add Server
      </Button>
    </>
  )
}

const serverFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
})

export function ServerForm({
  defaultValues,
  onServerChange,
  onOpenChange,
}: {
  defaultValues: UpsertServerData
  onServerChange?: (values: z.infer<typeof serverFormSchema>) => void
  onOpenChange?: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof serverFormSchema>>({
    resolver: zodResolver(serverFormSchema),
    defaultValues,
  })

  const onSubmit = (values: z.infer<typeof serverFormSchema>) => {
    onServerChange?.(values)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues.id !== undefined ? "Rename server" : "Add a server"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues.id !== undefined
              ? "Update the server name."
              : "Create a new server with a custom name."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Server" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your server.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {defaultValues.id !== undefined ? "Update" : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
