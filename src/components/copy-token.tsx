"use client"

import { Button } from "@/components/ui/button"
import { useFuse } from "@/hooks/use-fuse"
import { Check, Key } from "lucide-react"

export function CopyToken({ token }: { token: string }) {
  const [copied, setCopied] = useFuse(false)

  const onClick = () => {
    navigator.clipboard
      .writeText(token)
      .then(() => {
        setCopied(true, 2000)
      })
      .catch(() => {
        console.error("Failed to copy token to clipboard")
      })
  }

  return (
    <Button variant="secondary" onClick={onClick}>
      {copied ? <Check /> : <Key />}
      Copy Token
    </Button>
  )
}
