"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmDemo() {
  const { deleteProject } = useActions()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      variant="destructive"
      confirmLabel="Delete project"
      onConfirm={deleteProject}
      className="w-full max-w-sm"
    />
  )
}
