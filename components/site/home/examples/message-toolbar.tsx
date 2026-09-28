"use client"

import * as React from "react"
import { ArchiveIcon, CheckIcon, Trash2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome } from "@/components/site/home/examples/outcome"

export function MessageToolbar() {
  const [status, setStatus] = React.useState<"open" | "archived" | "deleted">(
    "open"
  )

  return (
    <Outcome
      done={status !== "open"}
      icon={status === "deleted" ? <Trash2Icon /> : <ArchiveIcon />}
      title={`Message ${status}`}
      onReset={() => setStatus("open")}
    >
      <div className="grid w-full gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>PS</AvatarFallback>
          </Avatar>
          <div className="grid flex-1">
            <span className="font-medium">Priya Shah</span>
            <span className="text-xs text-muted-foreground">Today, 9:41</span>
          </div>
          <div className="flex gap-1">
            <ConfirmButton
              gesture="click-again"
              variant="ghost"
              size="icon-sm"
              aria-label="Archive"
              confirmLabel={<CheckIcon />}
              onConfirm={() => setStatus("archived")}
            >
              <ArchiveIcon />
            </ConfirmButton>
            <ConfirmButton
              gesture="hold"
              variant="ghost"
              size="icon-sm"
              aria-label="Hold to delete"
              title="Hold to delete"
              onConfirm={() => setStatus("deleted")}
            >
              <Trash2Icon />
            </ConfirmButton>
          </div>
        </div>
        <div className="grid gap-1">
          <span className="font-medium">Launch checklist</span>
          <p className="text-muted-foreground">
            Final checklist for Thursday. Anything missing before we ship?
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">checklist.pdf</Badge>
          <Badge variant="outline">timeline.png</Badge>
        </div>
      </div>
    </Outcome>
  )
}
