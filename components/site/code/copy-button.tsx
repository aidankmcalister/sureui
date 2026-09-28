"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { SiteButton } from "@/components/site/ui/button"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <SiteButton
      variant="ghost"
      size="icon"
      aria-label={copied ? "Copied" : "Copy"}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </SiteButton>
  )
}
