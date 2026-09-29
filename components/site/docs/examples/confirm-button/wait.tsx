"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import {
  useActions,
  useAutoReset,
  useControl,
} from "@/components/site/docs/preview"

export default function ConfirmButtonWait() {
  const { deleteProject } = useActions()
  const control = useControl()
  useAutoReset(control("wait", 3000) + 3000)

  return (
    <ConfirmButton
      wait={control("wait", 3000)}
      variant="destructive"
      onConfirm={deleteProject}
    >
      Delete project
    </ConfirmButton>
  )
}
