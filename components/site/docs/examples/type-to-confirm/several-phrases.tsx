"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmSeveralPhrases() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase={["acme-prod", "delete my project"]}
      label={[
        <>
          Enter the project name <strong>acme-prod</strong>
        </>,
        <>
          To verify, type <strong>delete my project</strong>
        </>,
      ]}
      confirmLabel="Delete project"
      onConfirm={() => log("Deleted acme-prod")}
      className="w-full max-w-sm"
    />
  )
}
