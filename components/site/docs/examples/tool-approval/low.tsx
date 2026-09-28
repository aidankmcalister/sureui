"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ToolApprovalLow() {
  const log = useLog()
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
        log(
          response.approved
            ? "Approved: send the weekly summary email"
            : `Denied${response.reason ? `: ${response.reason}` : ""}`
        )
      }}
    />
  )
}
