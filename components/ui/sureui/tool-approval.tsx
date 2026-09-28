"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type ToolApprovalRisk = "low" | "medium" | "high" | "critical"

type ToolApprovalPart = {
  state: string
  approval?: {
    id: string
    approved?: boolean
    reason?: string
  }
}

type ToolApprovalResponse = {
  id: string
  approved: boolean
  reason?: string
}

type ToolApprovalProps = {
  part: ToolApprovalPart
  onRespond: (response: ToolApprovalResponse) => void | PromiseLike<unknown>
  approveLabel?: string
  denyLabel?: string
  approvedLabel?: React.ReactNode
  deniedLabel?: React.ReactNode
  undo?: boolean | number
  timeout?: number
  duration?: number
  className?: string
} & (
  | { risk?: Exclude<ToolApprovalRisk, "critical">; phrase?: never }
  | { risk: "critical"; phrase: string }
)

const answered = new Set([
  "approval-responded",
  "output-available",
  "output-error",
  "output-denied",
])

function ToolApproval({
  part,
  onRespond,
  risk = "medium",
  phrase,
  approveLabel = risk === "high" ? "Hold to approve" : "Approve",
  denyLabel = "Deny",
  approvedLabel = "Approved",
  deniedLabel = "Denied",
  undo = true,
  timeout,
  duration,
  className,
}: ToolApprovalProps) {
  const [undoing, setUndoing] = React.useState(false)
  const [responding, setResponding] = React.useState(false)
  const respondedRef = React.useRef(false)
  const approval = part.approval

  if (!approval) return null

  if (answered.has(part.state) && approval.approved !== undefined) {
    return (
      <p
        data-slot="tool-approval"
        data-state={approval.approved ? "approved" : "denied"}
        className={cn("text-sm text-muted-foreground", className)}
      >
        {approval.approved ? approvedLabel : deniedLabel}
        {!approval.approved && approval.reason && `: ${approval.reason}`}
      </p>
    )
  }

  if (part.state !== "approval-requested") return null

  const id = approval.id

  function respond(approved: boolean) {
    if (respondedRef.current) return
    respondedRef.current = true
    setResponding(true)
    const release = () => {
      respondedRef.current = false
      setResponding(false)
    }
    try {
      const result = onRespond({ id, approved })
      if (!result) return
      return Promise.resolve(result).then(undefined, (error: unknown) => {
        release()
        throw error
      })
    } catch (error) {
      release()
      throw error
    }
  }

  const denyButton = (
    <Button
      type="button"
      variant="outline"
      disabled={undoing || responding}
      onClick={() => respond(false)}
    >
      {denyLabel}
    </Button>
  )

  if (risk === "critical") {
    return (
      <div
        data-slot="tool-approval"
        data-state="requested"
        className={className}
      >
        <TypeToConfirm
          phrase={phrase ?? ""}
          confirmLabel={approveLabel}
          onConfirm={() => respond(true)}
          renderActions={(approveButton) => (
            <div className="flex flex-wrap gap-2">
              {approveButton}
              {denyButton}
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <div
      data-slot="tool-approval"
      data-state="requested"
      className={cn("flex flex-wrap gap-2", className)}
    >
      <ConfirmButton
        gesture={
          risk === "low" ? "click" : risk === "medium" ? "click-again" : "hold"
        }
        variant={risk === "high" ? "destructive" : "default"}
        undo={risk === "low" ? undo : undefined}
        timeout={timeout}
        duration={duration}
        disabled={responding}
        onClick={(event) => {
          if (risk === "low" && event.currentTarget.dataset.state === "idle") {
            setUndoing(true)
          }
        }}
        onCancel={() => setUndoing(false)}
        onConfirm={() => respond(true)}
      >
        {approveLabel}
      </ConfirmButton>
      {denyButton}
    </div>
  )
}

export {
  ToolApproval,
  type ToolApprovalPart,
  type ToolApprovalProps,
  type ToolApprovalResponse,
  type ToolApprovalRisk,
}
