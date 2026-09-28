"use client"

import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Outcome, useToggle } from "@/components/site/home/examples/outcome"

const dangers = [
  {
    id: "pause",
    title: "Pause deployments",
    description: "New pushes stop deploying until you resume.",
    done: "Deployments paused.",
  },
  {
    id: "transfer",
    title: "Transfer project",
    description: "Move acme-prod to another team.",
    done: "Transferred to Design.",
  },
  {
    id: "delete",
    title: "Delete project",
    description: "Removes every deployment and its data for good.",
    done: "Deleted, with every deployment.",
  },
]

export function DangerZone() {
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
    if (id === "transfer") {
      return (
        <ConfirmDialog
          title="Transfer acme-prod?"
          description="Members of Acme lose access. Owners of Design get it."
          confirmLabel="Transfer"
          onConfirm={finish}
        >
          <Button variant="outline" size="sm">
            Transfer
          </Button>
        </ConfirmDialog>
      )
    }
    return (
      <ConfirmDialog
        title="Delete acme-prod?"
        description="This removes the project, its deployments and its data for good."
        phrase="acme-prod"
        acknowledgements={["Active deployments will go offline."]}
        confirmLabel="Delete project"
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
      done={done.count === dangers.length}
      icon={<CheckIcon />}
      title="All three actions ran"
    >
      <div className="grid w-full divide-y text-sm">
        {dangers.map((danger) => (
          <div
            key={danger.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5">
              <span className="font-medium">{danger.title}</span>
              <span className="text-muted-foreground">
                {done.has(danger.id) ? danger.done : danger.description}
              </span>
            </div>
            {!done.has(danger.id) && control(danger.id)}
          </div>
        ))}
      </div>
    </Outcome>
  )
}
