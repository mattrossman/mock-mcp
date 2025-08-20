"use client"

import { Plus } from "lucide-react"
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
  DialogTrigger,
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
import { useState } from "react"
import { Database } from "../../../database.types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type ToolsRow = Database["public"]["Tables"]["tools"]["Row"]

type UpsertToolData = {
  id?: string // Omitted if we're adding a new row
  name: string
  description: string
}

export function ToolSection({
  serverId,
  tools,
}: {
  serverId: string
  tools: ToolsRow[]
}) {
  const supabase = createClient()
  const router = useRouter()

  const [editingTool, setEditingTool] = useState<UpsertToolData>()

  const handleUpsertTool = async (data: UpsertToolData) => {
    await supabase.from("tools").upsert({ server_id: serverId, ...data })
    router.refresh()
    setEditingTool(undefined)
  }

  const handleAddTool = () => {
    setEditingTool({
      name: "",
      description: "",
    })
  }

  return (
    <section className="mt-10 mb-10">
      {editingTool && (
        <ToolForm
          defaultValues={editingTool}
          onToolChange={(values) => {
            handleUpsertTool({ id: editingTool.id, ...values })
          }}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTool(undefined)
            }
          }}
        />
      )}

      <header className="flex items-center mb-10">
        <h1 className="text-2xl font-bold grow">Tools</h1>
        <Button onClick={handleAddTool} className="flex items-center gap-2">
          <Plus /> Add Tool
        </Button>
      </header>

      <ul className="grid gap-4">
        {tools.map((tool) => (
          <li key={tool.id}>
            <ToolCard tool={tool} onEdit={() => setEditingTool(tool)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const toolFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  description: z.string(),
})

export function ToolForm({
  defaultValues,
  onToolChange,
  onOpenChange,
}: {
  defaultValues: UpsertToolData
  onToolChange?: (values: z.infer<typeof toolFormSchema>) => void
  onOpenChange?: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof toolFormSchema>>({
    resolver: zodResolver(toolFormSchema),
    defaultValues,
  })

  const onSubmit = (values: z.infer<typeof toolFormSchema>) => {
    onToolChange?.(values)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues.id !== undefined ? "Edit tool" : "Add a tool"}
          </DialogTitle>
          <DialogDescription>
            {
              "Define your tool's name and description. You'll add parameters later."
            }
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
                    <Input placeholder="my_tool" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the tool.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Do something..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Detailed explanation of what the tool does and when to use
                    it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function ToolCard({
  tool,
  onEdit,
}: {
  tool: ToolsRow
  onEdit: () => void
}) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async (toolId: string) => {
    await supabase.from("tools").delete().eq("id", toolId)
    router.refresh()
  }

  return (
    <div className="bg-card border rounded-md px-6 py-6 flex items-center">
      <span className="grow">{tool.name}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => handleDelete(tool.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}
