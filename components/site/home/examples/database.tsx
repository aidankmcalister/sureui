"use client"

import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Outcome, useToggle } from "@/components/site/home/examples/outcome"

const actions = [
  {
    id: "pause",
    title: "Pause database",
    description: "Stops billing until someone connects again.",
    done: "Paused.",
  },
  {
    id: "restore",
    title: "Restore backup",
    description: "Go back to this morning's 6:00 backup.",
    done: "Restored to 6:00.",
  },
  {
    id: "delete",
    title: "Delete database",
    description: "Deletes all data and backups for good.",
    done: "Deleted.",
  },
]

export function Database() {
  const done = useToggle()

  function control(id: string) {
    const finish = () => done.toggle(id)
    if (id === "pause") {
      return (
        <ConfirmButton undo variant="outline" size="sm" onConfirm={finish}>
          Pause
        </ConfirmButton>
      )
    }
    if (id === "restore") {
      return (
        <ConfirmDialog
          title="Restore the 6:00 backup?"
          description="Changes made after 6:00 will be lost."
          confirmLabel="Restore"
          onConfirm={finish}
        >
          <Button variant="outline" size="sm">
            Restore
          </Button>
        </ConfirmDialog>
      )
    }
    return (
      <ConfirmDialog
        title="Delete orders-db?"
        description="This deletes all data and backups for good."
        phrase="orders-db"
        confirmLabel="Delete database"
        variant="destructive"
        onConfirm={finish}
      >
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </ConfirmDialog>
    )
  }

  return (
    <Outcome
      done={done.count === actions.length}
      icon={<CheckIcon />}
      title="All done"
    >
      <div className="grid w-full divide-y text-sm">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5">
              <span className="font-medium">{action.title}</span>
              <span className="text-muted-foreground">
                {done.has(action.id) ? action.done : action.description}
              </span>
            </div>
            {!done.has(action.id) && control(action.id)}
          </div>
        ))}
      </div>
    </Outcome>
  )
}
