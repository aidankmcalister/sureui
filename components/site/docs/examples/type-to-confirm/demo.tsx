"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmDemo() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      confirmLabel="Delete project"
      onConfirm={() => log("Deleted acme-prod")}
      className="w-full max-w-sm"
    />
  )
}
