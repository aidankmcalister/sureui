"use client"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import {
  ConfirmDialog,
  useConfirm,
} from "@/components/ui/sureui/confirm-dialog"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useReport } from "@/components/site/preview"

export function UndoDemo() {
  const report = useReport()

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const committed = await undoToast("Moved 3 files to trash")
        report(`undoToast() → ${committed}`)
      }}
    >
      Move to trash
    </Button>
  )
}

export function ConfirmButtonDemo() {
  const report = useReport()

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmButton
        variant="outline"
        undo
        onConfirm={() =>
          report('<ConfirmButton gesture="click" /> → onConfirm')
        }
        onCancel={() => report('<ConfirmButton gesture="click" /> → onCancel')}
      >
        Move to trash
      </ConfirmButton>
      <ConfirmButton
        gesture="click-again"
        variant="outline"
        onConfirm={() =>
          report('<ConfirmButton gesture="click-again" /> → onConfirm')
        }
        onCancel={() =>
          report('<ConfirmButton gesture="click-again" /> → onCancel')
        }
      >
        Archive
      </ConfirmButton>
      <ConfirmButton
        gesture="hold"
        variant="destructive"
        onConfirm={() => report('<ConfirmButton gesture="hold" /> → onConfirm')}
        onCancel={() => report('<ConfirmButton gesture="hold" /> → onCancel')}
      >
        Hold to delete
      </ConfirmButton>
    </div>
  )
}

export function ConfirmDialogDemo() {
  const report = useReport()
  const { confirm, dialog } = useConfirm()

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmDialog
        title="Leave the Design team?"
        description="An admin can add you back later."
        confirmLabel="Leave team"
        variant="destructive"
        onConfirm={() => report("<ConfirmDialog /> → onConfirm")}
      >
        <Button variant="outline">Leave team</Button>
      </ConfirmDialog>
      <Button
        variant="outline"
        onClick={async () => {
          const ok = await confirm({
            title: "Discard this draft?",
            confirmLabel: "Discard",
            variant: "destructive",
          })
          report(`useConfirm() → ${ok}`)
        }}
      >
        Discard draft
      </Button>
      {dialog}
    </div>
  )
}

export function TypeToConfirmDemo() {
  const report = useReport()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      acknowledgements={["I understand active deployments will go offline."]}
      confirmLabel="Delete project"
      onConfirm={() => report("<TypeToConfirm /> → onConfirm")}
      className="w-full max-w-sm"
    />
  )
}
