"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ToolApprovalHigh() {
  const log = useLog()
  const control = useControl()
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  return (
    <ToolApproval
      risk="high"
      duration={control("duration", 1200)}
      part={part}
      onRespond={(response) => {
        setPart({ state: "approval-responded", approval: response })
        log(
          response.approved
            ? "Approved: rotate the production database password"
            : `Denied${response.reason ? `: ${response.reason}` : ""}`
        )
      }}
    />
  )
}
