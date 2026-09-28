"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function TypeToConfirmDemo() {
  const log = useLog()

  async function deleteProject() {
    await wait(1000)
    log("Deleted acme-prod")
  }

  return (
    <TypeToConfirm
      phrase="acme-prod"
      confirmLabel="Delete project"
      onConfirm={deleteProject}
      className="w-full max-w-sm"
    />
  )
}
