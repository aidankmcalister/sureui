"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"

type DangerZoneProps = {
  project?: string
  team?: string
  transferTo?: string
  className?: string
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function DangerZone({
  project = "acme-prod",
  team = "Acme",
  transferTo = "Design",
  className,
}: DangerZoneProps) {
  const [paused, setPaused] = React.useState(false)
  const [resuming, setResuming] = React.useState(false)
  const [owner, setOwner] = React.useState(team)
  const [deleted, setDeleted] = React.useState(false)
  const transferred = owner !== team

  if (deleted) {
    return (
      <Card className={cn("w-full", className)}>
        <Empty role="status" className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trash2Icon />
            </EmptyMedia>
            <EmptyTitle>{project} was deleted</EmptyTitle>
            <EmptyDescription>
              Its deployments, domains and data are gone.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    )
  }

  const rows = [
    {
      title: "Pause deployments",
      badge: paused ? "Paused" : undefined,
      description: paused
        ? "New pushes wait until you resume. The current deployment stays live."
        : "New pushes stop deploying until you resume.",
      action: paused ? (
        <Button
          variant="outline"
          size="sm"
          disabled={resuming}
          onClick={async () => {
            setResuming(true)
            await request()
            setPaused(false)
            setResuming(false)
          }}
        >
          Resume
        </Button>
      ) : (
        <ConfirmButton
          undo
          variant="outline"
          size="sm"
          onConfirm={async () => {
            await request()
            setPaused(true)
          }}
        >
          Pause
        </ConfirmButton>
      ),
    },
    {
      title: "Transfer project",
      badge: transferred ? "Transferred" : undefined,
      description: transferred
        ? `${owner} owns ${project} now. Members of ${team} no longer have access.`
        : `Move ${project} from ${team} to ${transferTo}.`,
      action: transferred ? null : (
        <ConfirmDialog
          title={`Transfer ${project} to ${transferTo}?`}
          description={`Members of ${team} lose access. Owners of ${transferTo} get it, along with its deployments and domains.`}
          confirmLabel="Transfer"
          onConfirm={async () => {
            await request()
            setOwner(transferTo)
          }}
        >
          <Button variant="outline" size="sm">
            Transfer
          </Button>
        </ConfirmDialog>
      ),
    },
    {
      title: "Delete project",
      description: "Removes every deployment, domain and its data for good.",
      action: (
        <ConfirmDialog
          title={`Delete ${project}?`}
          description="This removes the project, its deployments, domains and data. It can't be undone."
          phrase={project}
          acknowledgements={["Active deployments will go offline."]}
          confirmLabel="Delete project"
          variant="destructive"
          onConfirm={async () => {
            await request()
            setDeleted(true)
          }}
        >
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </ConfirmDialog>
      ),
    },
  ]

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>
          These change who can use {project}, or remove it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y rounded-lg border">
          {rows.map((row) => (
            <div
              key={row.title}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="grid gap-1">
                <div className="flex items-center gap-2 font-medium">
                  {row.title}
                  {row.badge && <Badge variant="secondary">{row.badge}</Badge>}
                </div>
                <p className="text-pretty text-muted-foreground">
                  {row.description}
                </p>
              </div>
              {row.action && <div className="shrink-0">{row.action}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { DangerZone, type DangerZoneProps }
