"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmCaseAndSpaces() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase="delete my account"
      caseSensitive={false}
      trim
      confirmLabel="Delete account"
      onConfirm={() => log("Deleted the account")}
      className="w-full max-w-sm"
    />
  )
}
