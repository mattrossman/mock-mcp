"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  className?: string
  label?: string
}

export function CodeBlock({ code, className, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg">
        {label && (
          <span className="text-sm text-muted-foreground font-mono">
            {label}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 bg-card border border-t-0 border-border rounded-b-lg max-w-full">
        <code className="text-sm font-mono text-foreground whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
