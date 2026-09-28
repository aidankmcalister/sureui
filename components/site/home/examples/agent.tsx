"use client"

import * as React from "react"
import { BotIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { Outcome } from "@/components/site/home/examples/outcome"

const dots = [".", "..", "...", ".."]

function Waiting({ running }: { running: boolean }) {
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(
      () => setFrame((prev) => (prev + 1) % dots.length),
      400
    )
    return () => clearInterval(id)
  }, [running])

  return (
    <span aria-hidden className="inline-block w-[3ch]">
      <span className="motion-reduce:hidden">{dots[frame]}</span>
      <span className="hidden motion-reduce:inline">...</span>
    </span>
  )
}

export function Agent() {
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "call_1" },
  })

  const waiting = part.state === "approval-requested"

  return (
    <Outcome
      done={!waiting}
      icon={<BotIcon />}
      title={part.approval?.approved ? "Table deleted" : "Request denied"}
    >
      <div className="grid w-full gap-2 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <BotIcon className="size-4 shrink-0" />
          <span>
            Asking before I delete a table
            <Waiting running={waiting} />
          </span>
        </p>
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="grid gap-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Delete sessions_archive</span>
              <Badge variant="destructive">High risk</Badge>
            </div>
            <span className="text-muted-foreground">
              2.1M rows, last written 8 months ago
            </span>
          </div>
          <ToolApproval
            part={part}
            risk="high"
            onRespond={({ id, approved }) =>
              setPart({
                state: approved ? "output-available" : "output-denied",
                approval: { id, approved },
              })
            }
          />
        </div>
      </div>
    </Outcome>
  )
}
