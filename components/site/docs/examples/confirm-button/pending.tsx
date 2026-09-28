"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmButtonPending() {
  const log = useLog()

  async function deploy() {
    log("Deploying")
    await wait(2000)
    log("Deployed to production")
  }

  return (
    <ConfirmButton gesture="click-again" onConfirm={deploy}>
      Deploy
    </ConfirmButton>
  )
}
