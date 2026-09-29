"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ToolApprovalLow() {
  const { addToolApprovalResponse } = useActions()
  const control = useControl()
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  return (
    <ToolApproval
      risk="low"
      undo={control("undo", 5000)}
      part={part}
      onRespond={(response) => {
        setPart({ state: "approval-responded", approval: response })
        addToolApprovalResponse(response)
      }}
    />
  )
}
