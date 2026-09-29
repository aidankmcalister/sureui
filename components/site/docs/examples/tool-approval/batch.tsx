"use client"

import * as React from "react"

import {
  ToolApprovalBatch,
  type ToolApprovalPart,
  type ToolApprovalRisk,
} from "@/components/ui/sureui/tool-approval"
import { useActions } from "@/components/site/docs/preview"

type Call = ToolApprovalPart & { risk: ToolApprovalRisk }

export default function ToolApprovalBatchExample() {
  const { addToolApprovalResponse } = useActions()
  const [calls, setCalls] = React.useState<Call[]>([
    { state: "approval-requested", approval: { id: "call_1" }, risk: "low" },
    { state: "approval-requested", approval: { id: "call_2" }, risk: "medium" },
    { state: "approval-requested", approval: { id: "call_3" }, risk: "high" },
  ])

  return (
    <ToolApprovalBatch
      parts={calls}
      risk={(call) => call.risk}
      onRespond={(response) => {
        setCalls((current) =>
          current.map((call) =>
            call.approval?.id === response.id
              ? { ...call, state: "approval-responded", approval: response }
              : call
          )
        )
        addToolApprovalResponse(response)
      }}
    />
  )
}
