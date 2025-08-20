"use client"

import { Button } from "@/components/ui/button"
import { useFuse } from "@/hooks/use-fuse"
import { Check } from "lucide-react"
import React from "react"

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  text: string
  defaultIcon: React.ReactNode
  label: string
}
export function CopyButton({
  text,
  defaultIcon,
  label,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useFuse(false)

  const onClick = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true, 2000)
      })
      .catch(() => {
        console.error("Failed to copy token to clipboard")
      })
  }

  return (
    <Button onClick={onClick} {...props}>
      {copied ? <Check /> : defaultIcon}
      {label}
    </Button>
  )
}
