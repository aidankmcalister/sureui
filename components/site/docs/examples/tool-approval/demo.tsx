"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useActions } from "@/components/site/docs/preview"

export default function ToolApprovalDemo() {
  const { addToolApprovalResponse } = useActions()
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  return (
    <ToolApproval
      part={part}
      onRespond={(response) => {
        setPart({ state: "approval-responded", approval: response })
        addToolApprovalResponse(response)
      }}
    />
  )
}
