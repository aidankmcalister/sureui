"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"

type TrashedProject = {
  id: string
  name: string
  deletedAt: Date
}

type ScheduledDeletionProps = {
  workspace?: string
  today?: Date
  graceDays?: number
  initialTrash?: TrashedProject[]
  className?: string
}

const day = 24 * 60 * 60 * 1000

const sampleToday = new Date("2026-05-12T12:00:00Z")

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * day)
}

const sampleTrash: TrashedProject[] = [
  {
    id: "prj_1",
    name: "marketing-site",
    deletedAt: addDays(sampleToday, -3),
  },
  { id: "prj_2", name: "legacy-api", deletedAt: addDays(sampleToday, -12) },
  {
    id: "prj_3",
    name: "hackweek-demo",
    deletedAt: addDays(sampleToday, -27),
  },
]

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function request() {
  return Promise.resolve()
}

function ScheduledDeletion({
  workspace = "Acme",
  today = sampleToday,
  graceDays = 30,
  initialTrash = sampleTrash,
  className,
}: ScheduledDeletionProps) {
  const [deletesOn, setDeletesOn] = React.useState<Date | null>(null)
  const [keeping, setKeeping] = React.useState(false)
  const [trash, setTrash] = React.useState(initialTrash)
  const [message, setMessage] = React.useState("")
  const keepRef = React.useRef<HTMLButtonElement>(null)
  const deleteRef = React.useRef<HTMLButtonElement>(null)
  const trashRef = React.useRef<HTMLUListElement>(null)

  function focusLater(ref: React.RefObject<HTMLElement | null>) {
    requestAnimationFrame(() => ref.current?.focus())
  }

  async function scheduleDeletion() {
    await request()
    setDeletesOn(addDays(today, graceDays))
    focusLater(keepRef)
  }

  async function keep() {
    setKeeping(true)
    await request()
    setKeeping(false)
    setDeletesOn(null)
    setMessage(`${workspace} won't be deleted.`)
    focusLater(deleteRef)
  }

  function leaveTrash(project: TrashedProject, text: string) {
    setTrash((prev) => prev.filter((other) => other.id !== project.id))
    setMessage(text)
    focusLater(trashRef)
  }

  async function restore(project: TrashedProject) {
    await request()
    leaveTrash(project, `Restored ${project.name}.`)
  }

  async function deleteForever(project: TrashedProject) {
    await request()
    leaveTrash(project, `Deleted ${project.name} forever.`)
  }

  return (
    <Card className={cn("@container/workspace w-full", className)}>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>{workspace}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {deletesOn ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
            <p className="min-w-0 flex-1 basis-48 font-medium">
              Scheduled for deletion on {formatDate(deletesOn)}
            </p>
            <Button
              ref={keepRef}
              variant="outline"
              size="sm"
              disabled={keeping}
              onClick={keep}
            >
              Keep
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="grid min-w-0 flex-1 basis-48 gap-1">
              <p className="font-medium">Delete workspace</p>
              <p className="text-muted-foreground">
                {workspace} is deleted for good {graceDays} days later. You can
                keep it until then.
              </p>
            </div>
            <ConfirmDialog
              title={`Delete ${workspace}?`}
              description={`${workspace} goes offline now and is deleted for good on ${formatDate(addDays(today, graceDays))}. You can keep it until then.`}
              confirmLabel="Schedule deletion"
              variant="destructive"
              onConfirm={scheduleDeletion}
            >
              <Button ref={deleteRef} variant="destructive" size="sm">
                Delete
              </Button>
            </ConfirmDialog>
          </div>
        )}
        <div className="grid gap-2">
          <p className="border-t pt-4 font-medium">Trash</p>
          {trash.length === 0 ? (
            <p className="text-muted-foreground">Trash is empty</p>
          ) : (
            <ul
              ref={trashRef}
              tabIndex={-1}
              aria-label="Trash"
              className="divide-y outline-none"
            >
              {trash.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 last:pb-0"
                >
                  <div className="grid min-w-0 flex-1 basis-32">
                    <span className="truncate font-medium">{project.name}</span>
                    <span className="text-muted-foreground">
                      Deletes on{" "}
                      {formatDate(addDays(project.deletedAt, graceDays))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Restore ${project.name}`}
                      onClick={() => restore(project)}
                    >
                      Restore
                    </Button>
                    <ConfirmButton
                      gesture="hold"
                      variant="destructive"
                      size="sm"
                      aria-label={`Hold to delete ${project.name} forever`}
                      onConfirm={() => deleteForever(project)}
                    >
                      Delete forever
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {message}
        </p>
      </CardContent>
    </Card>
  )
}

export { ScheduledDeletion, type ScheduledDeletionProps, type TrashedProject }
