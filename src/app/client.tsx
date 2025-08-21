"use client"
import { Plus, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  server: Database["public"]["Tables"]["servers"]["Row"] & {
    tools: { name: string }[]
  }
}) {
  const maxToolsToShow = 4
  const toolsToShow = server.tools.slice(0, maxToolsToShow)
  const remainingTools = server.tools.slice(maxToolsToShow)
  const remainingToolsCount = remainingTools.length

  return (
    <Link
      href={`/${server.id}`}
      className="group block bg-card border rounded-md px-6 py-6 hover:bg-accent/50 hover:border-accent-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg mb-2 group-hover:text-foreground transition-colors">
            {server.name}
          </h3>
          {server.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {toolsToShow.map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool.name}
                </Badge>
              ))}
              {remainingToolsCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-help"
                  title={remainingTools.map((tool) => tool.name).join(", ")}
                >
                  +{remainingToolsCount} more
                </Badge>
              )}
            </div>
          )}
          {server.tools.length === 0 && (
            <p className="text-sm text-muted-foreground">No tools configured</p>
          )}
        </div>
        <div className="flex items-center ml-4 text-muted-foreground group-hover:text-foreground transition-colors">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
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
