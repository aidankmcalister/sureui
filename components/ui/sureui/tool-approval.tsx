"use client"

import * as React from "react"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type ToolApprovalRisk = "low" | "medium" | "high" | "critical"

type ToolApprovalScope = "once" | "session" | "always"

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
  scope?: ToolApprovalScope
}

type ToolApprovalScopeLabels = Partial<
  Record<ToolApprovalScope, React.ReactNode>
> & { group?: string }

type ToolApprovalOptions = {
  onRespond: (response: ToolApprovalResponse) => void | PromiseLike<unknown>
  approveLabel?: string
  denyLabel?: string
  approvedLabel?: React.ReactNode
  deniedLabel?: React.ReactNode
  undo?: boolean | number | "manual"
  timeout?: number
  duration?: number
  scopes?: ToolApprovalScope[]
  scopeLabels?: ToolApprovalScopeLabels
  className?: string
}

type ToolApprovalProps = ToolApprovalOptions & {
  part: ToolApprovalPart
} & (
    | { risk?: Exclude<ToolApprovalRisk, "critical">; phrase?: never }
    | { risk: "critical"; phrase: string }
  )

type ToolApprovalBatchProps<P extends ToolApprovalPart = ToolApprovalPart> =
  ToolApprovalOptions & {
    parts: P[]
    risk?: ToolApprovalRisk | ((part: P) => ToolApprovalRisk)
    phrase?: string
  }

type ApprovalActionsProps = {
  slot: string
  risk: ToolApprovalRisk
  phrase: string
  approveLabel: string
  denyLabel: string
  undo: boolean | number | "manual"
  timeout?: number
  duration?: number
  scopes?: ToolApprovalScope[]
  scopeLabels?: ToolApprovalScopeLabels
  scope?: ToolApprovalScope
  onScopeChange: (scope: ToolApprovalScope) => void
  disabled: boolean
  onAnswer: (approved: boolean) => void | Promise<unknown>
  className?: string
}

const answered = new Set([
  "approval-responded",
  "output-available",
  "output-error",
  "output-denied",
])

const risks: ToolApprovalRisk[] = ["low", "medium", "high", "critical"]

const defaultScopeLabels = {
  group: "Remember",
  once: "Once",
  session: "This session",
  always: "Always",
}

function isRequested(part: ToolApprovalPart) {
  return part.state === "approval-requested" && part.approval !== undefined
}

function withScope(
  response: ToolApprovalResponse,
  scope: ToolApprovalScope | undefined
) {
  return scope ? { ...response, scope } : response
}

function Outcome({
  slot,
  approval,
  approvedLabel,
  deniedLabel,
  className,
}: {
  slot: string
  approval: { approved?: boolean; reason?: string }
  approvedLabel: React.ReactNode
  deniedLabel: React.ReactNode
  className?: string
}) {
  return (
    <p
      data-slot={slot}
      data-state={approval.approved ? "approved" : "denied"}
      className={cn("text-sm text-muted-foreground", className)}
    >
      {approval.approved ? approvedLabel : deniedLabel}
      {!approval.approved && approval.reason && `: ${approval.reason}`}
    </p>
  )
}

function ApprovalActions({
  slot,
  risk,
  phrase,
  approveLabel,
  denyLabel,
  undo,
  timeout,
  duration,
  scopes,
  scopeLabels,
  scope,
  onScopeChange,
  disabled,
  onAnswer,
  className,
}: ApprovalActionsProps) {
  const [undoing, setUndoing] = React.useState(false)
  const labels = { ...defaultScopeLabels, ...scopeLabels }

  const scopeGroup =
    scopes && scopes.length > 0 ? (
      <RadioGroup
        data-slot="tool-approval-scope"
        aria-label={labels.group}
        value={scope}
        onValueChange={(value) => onScopeChange(value as ToolApprovalScope)}
        disabled={undoing || disabled}
        className="flex basis-full flex-wrap gap-1"
      >
        {scopes.map((value) => (
          <Radio.Root
            key={value}
            value={value}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground data-checked:bg-muted data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
            )}
          >
            {labels[value]}
          </Radio.Root>
        ))}
      </RadioGroup>
    ) : null

  const denyButton = (
    <Button
      type="button"
      variant="outline"
      disabled={undoing || disabled}
      onClick={() => onAnswer(false)}
    >
      {denyLabel}
    </Button>
  )

  if (risk === "critical") {
    return (
      <div data-slot={slot} data-state="requested" className={className}>
        <TypeToConfirm
          phrase={phrase}
          confirmLabel={approveLabel}
          onConfirm={() => onAnswer(true)}
          renderActions={(approveButton) => (
            <div className="flex flex-wrap gap-2">
              {scopeGroup}
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
      data-slot={slot}
      data-state="requested"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {scopeGroup}
      <ConfirmButton
        gesture={
          risk === "low" ? "click" : risk === "medium" ? "click-again" : "hold"
        }
        variant={risk === "high" ? "destructive" : "default"}
        undo={risk === "low" ? undo : undefined}
        timeout={timeout}
        duration={duration}
        disabled={disabled}
        onClick={(event) => {
          if (risk === "low" && event.currentTarget.dataset.state === "idle") {
            setUndoing(true)
          }
        }}
        onCancel={() => setUndoing(false)}
        onConfirm={() => onAnswer(true)}
      >
        {approveLabel}
      </ConfirmButton>
      {denyButton}
    </div>
  )
}

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
  scopes,
  scopeLabels,
  className,
}: ToolApprovalProps) {
  const [responding, setResponding] = React.useState(false)
  const [scope, setScope] = React.useState(scopes?.[0])
  const respondedRef = React.useRef(false)
  const approval = part.approval

  if (!approval) return null

  if (answered.has(part.state) && approval.approved !== undefined) {
    return (
      <Outcome
        slot="tool-approval"
        approval={approval}
        approvedLabel={approvedLabel}
        deniedLabel={deniedLabel}
        className={className}
      />
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
      const result = onRespond(withScope({ id, approved }, scope))
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

  return (
    <ApprovalActions
      slot="tool-approval"
      risk={risk}
      phrase={phrase ?? ""}
      approveLabel={approveLabel}
      denyLabel={denyLabel}
      undo={undo}
      timeout={timeout}
      duration={duration}
      scopes={scopes}
      scopeLabels={scopeLabels}
      scope={scope}
      onScopeChange={setScope}
      disabled={responding}
      onAnswer={respond}
      className={className}
    />
  )
}

function ToolApprovalBatch<P extends ToolApprovalPart>({
  parts,
  onRespond,
  risk = "medium",
  phrase = "approve all",
  approveLabel,
  denyLabel = "Deny all",
  approvedLabel = "Approved",
  deniedLabel = "Denied",
  undo = true,
  timeout,
  duration,
  scopes,
  scopeLabels,
  className,
}: ToolApprovalBatchProps<P>) {
  const [sent, setSent] = React.useState<ReadonlySet<string>>(() => new Set())
  const [scope, setScope] = React.useState(scopes?.[0])

  const requested = parts.filter(isRequested)
  const pending = requested.filter((part) => !sent.has(part.approval!.id))

  if (requested.length === 0) {
    const approvals = parts.flatMap((part) =>
      part.approval && answered.has(part.state) ? [part.approval] : []
    )
    const first = approvals[0]
    if (
      !first ||
      first.approved === undefined ||
      approvals.some((approval) => approval.approved !== first.approved)
    ) {
      return null
    }
    return (
      <Outcome
        slot="tool-approval-batch"
        approval={{ approved: first.approved }}
        approvedLabel={approvedLabel}
        deniedLabel={deniedLabel}
        className={className}
      />
    )
  }

  const level = (pending.length > 0 ? pending : requested).reduce<
    ToolApprovalRisk | undefined
  >((highest, part) => {
    const current = typeof risk === "function" ? risk(part) : risk
    return highest && risks.indexOf(highest) >= risks.indexOf(current)
      ? highest
      : current
  }, undefined)!
  const ids = pending.map((part) => part.approval!.id)

  function release(released: string[]) {
    setSent((current) => {
      const next = new Set(current)
      for (const id of released) next.delete(id)
      return next
    })
  }

  function respond(approved: boolean) {
    if (ids.length === 0) return
    setSent((current) => new Set([...current, ...ids]))
    const results: PromiseLike<unknown>[] = []
    for (const [index, id] of ids.entries()) {
      try {
        const result = onRespond(withScope({ id, approved }, scope))
        if (!result) continue
        results.push(
          Promise.resolve(result).then(undefined, (error: unknown) => {
            release([id])
            throw error
          })
        )
      } catch (error) {
        release(ids.slice(index))
        throw error
      }
    }
    if (results.length > 0) return Promise.all(results)
  }

  return (
    <ApprovalActions
      key={ids.join(" ")}
      slot="tool-approval-batch"
      risk={level}
      phrase={phrase}
      approveLabel={
        approveLabel ??
        (level === "high" ? "Hold to approve all" : "Approve all")
      }
      denyLabel={denyLabel}
      undo={undo}
      timeout={timeout}
      duration={duration}
      scopes={scopes}
      scopeLabels={scopeLabels}
      scope={scope}
      onScopeChange={setScope}
      disabled={ids.length === 0}
      onAnswer={respond}
      className={className}
    />
  )
}

export {
  ToolApproval,
  ToolApprovalBatch,
  type ToolApprovalBatchProps,
  type ToolApprovalPart,
  type ToolApprovalProps,
  type ToolApprovalResponse,
  type ToolApprovalRisk,
  type ToolApprovalScope,
  type ToolApprovalScopeLabels,
}
