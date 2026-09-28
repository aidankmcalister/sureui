"use client"

import * as React from "react"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Details, Outcome } from "@/components/site/home/examples/outcome"

export function Workspace() {
  const [left, setLeft] = React.useState(false)

  return (
    <Outcome
      done={left}
      icon={<LogOutIcon />}
      title="You left Acme"
      onReset={() => setLeft(false)}
    >
      <div className="grid w-full gap-3 text-sm">
        <Details
          rows={[
            ["Workspace", "Acme"],
            ["Plan", "Team"],
            ["Members", "12"],
          ]}
        />
        <ConfirmDialog
          title="Leave Acme?"
          description="You'll lose access to its projects until someone invites you back."
          confirmLabel="Leave"
          variant="destructive"
          onConfirm={() => setLeft(true)}
        >
          <Button variant="outline">Leave workspace</Button>
        </ConfirmDialog>
      </div>
    </Outcome>
  )
}
