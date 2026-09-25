"use client"

import { sure } from "@/components/ui/sure"
import { Button } from "@/components/ui/button"
import { ClickAgainButton } from "@/components/ui/click-again-button"
import { HoldButton } from "@/components/ui/hold-button"
import { useReport } from "@/components/site/result-log"

export function DialogsDemo() {
  const report = useReport()

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={async () => {
          const ok = await sure.confirm({
            title: "Leave the Design team?",
            description: "An admin can add you back later.",
            confirmLabel: "Leave team",
            variant: "destructive",
          })
          report(`sure.confirm() → ${ok}`)
        }}
      >
        Leave team
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          const name = await sure.prompt({
            title: "Rename team",
            label: "Team name",
            defaultValue: "Design",
            confirmLabel: "Rename",
          })
          report(`sure.prompt() → ${JSON.stringify(name)}`)
        }}
      >
        Rename
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          await sure.alert({
            title: "Export finished",
            description: "Your file is ready to download.",
          })
          report("sure.alert() → dismissed")
        }}
      >
        Export
      </Button>
    </div>
  )
}

export function ClickAgainDemo() {
  const report = useReport()

  return (
    <ClickAgainButton
      variant="outline"
      onConfirm={() => report("<ClickAgainButton /> → onConfirm")}
    >
      Archive
    </ClickAgainButton>
  )
}

export function HoldDemo() {
  const report = useReport()

  return (
    <HoldButton
      variant="destructive"
      onConfirm={() => report("<HoldButton /> → onConfirm")}
    >
      Hold to delete
    </HoldButton>
  )
}

export function TypeDemo() {
  const report = useReport()

  return (
    <Button
      variant="destructive"
      onClick={async () => {
        const ok = await sure.type({
          title: "Delete acme-prod?",
          description: "This permanently deletes the project and its data.",
          phrase: "acme-prod",
          confirmLabel: "Delete project",
          variant: "destructive",
        })
        report(`sure.type() → ${ok}`)
      }}
    >
      Delete project
    </Button>
  )
}

export function UndoDemo() {
  const report = useReport()

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const committed = await sure.undo("Deleted 3 files")
        report(`sure.undo() → ${committed}`)
      }}
    >
      Delete 3 files
    </Button>
  )
}
