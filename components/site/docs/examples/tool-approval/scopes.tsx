"use client"

import * as React from "react"

import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { useLog } from "@/components/site/docs/preview"

export default function ToolApprovalScopes() {
  const log = useLog()
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  return (
    <ToolApproval
      scopes={["once", "session", "always"]}
      part={part}
      onRespond={(response) => {
        setPart({ state: "approval-responded", approval: response })
        log(
          `${response.approved ? "Approved" : "Denied"} readFile, scope: ${response.scope}`
        )
      }}
    />
  )
}
