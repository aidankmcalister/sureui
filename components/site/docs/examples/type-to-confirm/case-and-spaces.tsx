"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmCaseAndSpaces() {
  const { deleteAccount } = useActions()

  return (
    <TypeToConfirm
      phrase="delete my account"
      caseSensitive={false}
      trim
      confirmLabel="Delete account"
      onConfirm={deleteAccount}
      className="w-full max-w-sm"
    />
  )
}
