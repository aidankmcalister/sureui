"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmButtonDemo() {
  const log = useLog()

  async function deleteProject() {
    await wait(1000)
    log("Deleted acme-prod")
  }

  return (
    <ConfirmButton
      gesture="click-again"
      variant="destructive"
      onConfirm={deleteProject}
      onCancel={() => log("Disarmed, nothing deleted")}
    >
      Delete project
    </ConfirmButton>
  )
}
