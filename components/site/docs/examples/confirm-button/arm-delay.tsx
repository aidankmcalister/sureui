"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonArmDelay() {
  const { deleteProject } = useActions()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="click-again"
      armDelay={control("armDelay", 500)}
      onConfirm={deleteProject}
    >
      Delete project
    </ConfirmButton>
  )
}
