"use client"

import * as React from "react"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmButtonErrors() {
  const log = useLog()
  const offline = React.useRef(false)

  async function publish() {
    await wait(1000)
    offline.current = !offline.current
    if (offline.current) throw new Error("Network error")
    log("Published")
  }

  return (
    <ConfirmButton
      errorLabel="Couldn't publish. Retry"
      onConfirm={publish}
      onConfirmError={(error) => log(String(error))}
    >
      Publish
    </ConfirmButton>
  )
}
