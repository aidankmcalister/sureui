"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useActions } from "@/components/site/docs/preview"

export default function ToolApprovalErrors() {
  const { addToolApprovalResponse, showError } = useActions({
    addToolApprovalResponse: { wait: 1000, fail: "Network error" },
  })
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  return (
    <ToolApproval
      errorLabel="Couldn't send. Retry"
      part={part}
      onRespond={async (response) => {
        await addToolApprovalResponse(response)
        setPart({ state: "approval-responded", approval: response })
      }}
      onConfirmError={showError}
    />
  )
}
