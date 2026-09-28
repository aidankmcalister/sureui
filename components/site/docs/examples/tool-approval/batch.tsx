"use client"

import * as React from "react"

import {
  ToolApprovalBatch,
  type ToolApprovalPart,
  type ToolApprovalRisk,
} from "@/components/ui/sureui/tool-approval"
import { useLog } from "@/components/site/docs/preview"

type Call = ToolApprovalPart & { title: string; risk: ToolApprovalRisk }

export default function ToolApprovalBatchExample() {
  const log = useLog()
  const [calls, setCalls] = React.useState<Call[]>([
    {
      state: "approval-requested",
      approval: { id: "call_1" },
      title: "Archive 12 stale branches",
      risk: "low",
    },
    {
      state: "approval-requested",
      approval: { id: "call_2" },
      title: "Rotate the staging API key",
      risk: "medium",
    },
    {
      state: "approval-requested",
      approval: { id: "call_3" },
      title: "Delete the preview-42 environment",
      risk: "high",
    },
  ])

  return (
    <div className="grid w-full max-w-sm gap-3 text-sm">
      <ul className="grid gap-1">
        {calls.map((call) => (
          <li key={call.approval?.id} className="flex justify-between gap-4">
            <span>{call.title}</span>
            <span className="text-muted-foreground">{call.risk}</span>
          </li>
        ))}
      </ul>
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
          log(`${response.approved ? "Approved" : "Denied"} ${response.id}`)
        }}
      />
    </div>
  )
}
