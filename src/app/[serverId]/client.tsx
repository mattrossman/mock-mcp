"use client"

import { Plus, Plug, Edit, Trash2 } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Database } from "../../../database.types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CodeBlock } from "@/components/code-block"
import { getServerUrl } from "@/lib/get-server-url"

type ToolsRow = Database["public"]["Tables"]["tools"]["Row"]
type ParametersRow = Database["public"]["Tables"]["parameters"]["Row"]
type ParameterType = Database["public"]["Enums"]["parameter_type"]

type UpsertToolData = {
  id?: string // Omitted if we're adding a new row
  name: string
  description: string
}

type UpsertParameterData = {
  id?: string // Omitted if we're adding a new row
  name: string
  description: string
  type: ParameterType
}

export function ToolSection({
  serverId,
  tools,
}: {
  serverId: string
  tools: (ToolsRow & { parameters?: ParametersRow[] })[]
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

      {tools.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Add a tool to get started
        </p>
      ) : (
        <ul className="grid gap-4">
          {tools.map((tool) => (
            <li key={tool.id}>
              <ToolCard tool={tool} onEdit={() => setEditingTool(tool)} />
            </li>
          ))}
        </ul>
      )}
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
  tool: ToolsRow & { parameters?: ParametersRow[] }
  onEdit: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [editingParameter, setEditingParameter] =
    useState<UpsertParameterData>()

  const deleteTool = async (toolId: string) => {
    await supabase.from("tools").delete().eq("id", toolId)
    router.refresh()
  }

  const upsertParameter = async (data: UpsertParameterData) => {
    await supabase.from("parameters").upsert({ tool_id: tool.id, ...data })
    router.refresh()
    setEditingParameter(undefined)
  }

  const deleteParameter = async (parameterId: string) => {
    await supabase.from("parameters").delete().eq("id", parameterId)
    router.refresh()
  }

  const onClickAddParameter = () => {
    setEditingParameter({
      name: "",
      description: "",
      type: "string",
    })
  }

  return (
    <div className="bg-card border rounded-md px-6 py-6">
      {editingParameter && (
        <ParameterForm
          defaultValues={editingParameter}
          onParameterChange={(values) => {
            upsertParameter({ id: editingParameter.id, ...values })
          }}
          onOpenChange={(open) => {
            if (!open) {
              setEditingParameter(undefined)
            }
          }}
        />
      )}

      <div className="flex items-center mb-4">
        <div className="grow">
          <h3 className="font-semibold">{tool.name}</h3>
          {tool.description && (
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteTool(tool.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Parameters</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={onClickAddParameter}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Parameter
          </Button>
        </div>

        {tool.parameters && tool.parameters.length > 0 ? (
          <div className="space-y-2">
            {tool.parameters.map((parameter) => (
              <div
                key={parameter.id}
                className="flex items-center justify-between bg-muted/50 rounded-sm p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {parameter.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {parameter.type}
                    </Badge>
                  </div>
                  {parameter.description && (
                    <p className="text-xs text-muted-foreground">
                      {parameter.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingParameter(parameter)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteParameter(parameter.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No parameters configured
          </p>
        )}
      </div>
    </div>
  )
}

const parameterFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  description: z.string(),
  type: z.enum(["string", "number", "boolean"]),
})

export function ParameterForm({
  defaultValues,
  onParameterChange,
  onOpenChange,
}: {
  defaultValues: UpsertParameterData
  onParameterChange?: (values: z.infer<typeof parameterFormSchema>) => void
  onOpenChange?: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof parameterFormSchema>>({
    resolver: zodResolver(parameterFormSchema),
    defaultValues,
  })

  const onSubmit = (values: z.infer<typeof parameterFormSchema>) => {
    onParameterChange?.(values)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues.id !== undefined
              ? "Edit parameter"
              : "Add a parameter"}
          </DialogTitle>
          <DialogDescription>
            Configure the parameter&apos;s name, description, and type.
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
                    <Input placeholder="my_parameter" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the parameter.
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
                    <Input
                      placeholder="A description of what this parameter does..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed explanation of what the parameter is for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parameter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The data type for this parameter.
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

export function ConnectButton({
  serverId,
  accessToken,
}: {
  serverId: string
  accessToken: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Plug className="h-4 w-4" />
        Connect
      </Button>
      <ConnectDialog
        serverId={serverId}
        accessToken={accessToken}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

export function ConnectDialog({
  serverId,
  accessToken,
  open,
  onOpenChange,
}: {
  serverId: string
  accessToken: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const serverUrl = getServerUrl(serverId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Connect to Server
          </DialogTitle>
          <DialogDescription>
            Use these credentials to connect your MCP client to this server.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <CodeBlock className="min-w-0" code={serverUrl} label="URL" />

          <CodeBlock
            className="min-w-0"
            code={accessToken}
            label="Bearer Token"
          />

          <div className="bg-card rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">
              Connection Instructions
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>In your MCP client (e.g. Cursor, Claude Code, VS Code):</p>
              <p>1. Copy the URL and set it as the remote server URL</p>
              <p>{`2. Copy the token and add it an "Authorization" header with the value "Bearer <TOKEN>"`}</p>
              <p>
                3. Connect to the server and try using your configured tools!
              </p>
              <p className="text-xs italic mt-3">
                Note: Tokens expire after 1 week, so you may need to copy it
                again later
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type UpsertServerData = {
  id?: string
  name: string
}

export function ServerHeader({
  server,
}: {
  server: Database["public"]["Tables"]["servers"]["Row"]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [editingServer, setEditingServer] = useState<UpsertServerData>()

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
    <>
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

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold grow">{server.name}</h1>
        <Button variant="ghost" size="sm" onClick={handleRename}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
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
          <DialogTitle>Rename server</DialogTitle>
          <DialogDescription>Update the server name.</DialogDescription>
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
            <Button type="submit">Update</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteServerSection({
  server,
}: {
  server: Database["public"]["Tables"]["servers"]["Row"] & {
    tools?: { name: string }[]
  }
}) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    await supabase.from("servers").delete().eq("id", server.id)
    router.push("/")
  }

  return (
    <section className="mt-16 pt-8 border-t">
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Delete Server
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete this server and all its tools. This action cannot
          be undone.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Server
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            Tools
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Server Deletion</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to delete the server{" "}
                  <strong>{server.name}</strong>?
                </p>
                {server.tools && server.tools.length > 0 ? (
                  <p>
                    This will also delete {server.tools.length} tool
                    {server.tools.length === 1 ? "" : "s"}.
                  </p>
                ) : (
                  <p>This server has no tools.</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Server
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}
