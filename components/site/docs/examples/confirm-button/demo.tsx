"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmButtonDemo() {
  const { deleteProject } = useActions()

  return (
    <ConfirmButton
      gesture="click-again"
      variant="destructive"
      onConfirm={deleteProject}
    >
      Delete project
    </ConfirmButton>
  )
}
