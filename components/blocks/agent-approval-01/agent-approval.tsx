"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ToolApproval,
  type ToolApprovalPart,
  type ToolApprovalResponse,
  type ToolApprovalRisk,
} from "@/components/ui/sureui/tool-approval"

type ToolCall = {
  id: string
  tool: string
  title: string
  input: Record<string, string>
  output: string
  risk: ToolApprovalRisk
  phrase?: string
}

type AgentApprovalProps = {
  prompt?: string
  reply?: string
  initialCalls?: ToolCall[]
  className?: string
}

const sampleCalls: ToolCall[] = [
  {
    id: "call_1",
    tool: "sendMessage",
    title: "Tell #deploys that staging is going away",
    input: { channel: "#deploys" },
    output: "Posted in #deploys",
    risk: "low",
  },
  {
    id: "call_2",
    tool: "archiveBranches",
    title: "Archive 12 branches merged more than 30 days ago",
    input: { repo: "acme/web", count: "12" },
    output: "Archived 12 branches",
    risk: "medium",
  },
  {
    id: "call_3",
    tool: "rotateSecret",
    title: "Rotate the staging database password",
    input: { database: "staging-db" },
    output: "Rotated the password for staging-db",
    risk: "high",
  },
  {
    id: "call_4",
    tool: "deleteProject",
    title: "Delete acme-staging and its deployments",
    input: { project: "acme-staging" },
    output: "Deleted acme-staging",
    risk: "critical",
    phrase: "acme-staging",
  },
]

const riskLabels: Record<ToolApprovalRisk, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "Critical",
}

function request() {
  return Promise.resolve()
}

function AgentApproval({
  prompt = "Tear down staging. Everything runs on preview deploys now.",
  reply = "Here's the plan. Each step waits for your approval.",
  initialCalls = sampleCalls,
  className,
}: AgentApprovalProps) {
  const [parts, setParts] = React.useState<Record<string, ToolApprovalPart>>(
    () =>
      Object.fromEntries(
        initialCalls.map((call) => [
          call.id,
          { state: "approval-requested", approval: { id: call.id } },
        ])
      )
  )

  async function respond({ id, approved }: ToolApprovalResponse) {
    setParts((prev) => ({
      ...prev,
      [id]: {
        state: approved ? "approval-responded" : "output-denied",
        approval: { id, approved },
      },
    }))
    if (!approved) return
    await request()
    setParts((prev) => ({
      ...prev,
      [id]: { state: "output-available", approval: { id, approved } },
    }))
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="grid gap-4">
        <p className="ml-auto max-w-[85%] rounded-lg bg-muted px-3 py-2">
          {prompt}
        </p>
        <p>{reply}</p>
        <ol className="grid gap-3">
          {initialCalls.map((call) => {
            const part = parts[call.id]
            return (
              <li key={call.id} className="grid gap-3 rounded-lg border p-3">
                <div className="grid gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <code className="truncate font-mono text-xs text-muted-foreground">
                      {call.tool}
                    </code>
                    <Badge
                      variant={
                        call.risk === "critical" ? "destructive" : "outline"
                      }
                    >
                      {riskLabels[call.risk]}
                    </Badge>
                  </div>
                  <p className="font-medium">{call.title}</p>
                  <dl className="flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground">
                    {Object.entries(call.input).map(([key, value]) => (
                      <div key={key} className="flex gap-1">
                        <dt>{key}:</dt>
                        <dd className="text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <ToolApproval
                  part={part}
                  {...(call.risk === "critical"
                    ? { risk: call.risk, phrase: call.phrase ?? call.tool }
                    : { risk: call.risk })}
                  approvedLabel={
                    part.state === "output-available" ? call.output : "Running…"
                  }
                  onRespond={respond}
                />
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export { AgentApproval, type AgentApprovalProps, type ToolCall }
