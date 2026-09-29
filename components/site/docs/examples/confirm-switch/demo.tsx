"use client"

import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmSwitchDemo() {
  const { setPublic } = useActions()

  return <ConfirmSwitch aria-label="Public repository" onConfirm={setPublic} />
}
