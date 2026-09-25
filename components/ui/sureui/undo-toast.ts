import type { ReactNode } from "react"
import { toast } from "sonner"

type UndoToastOptions = {
  description?: ReactNode
  duration?: number
  undoLabel?: string
}

function undoToast(
  message: ReactNode,
  { description, duration = 5000, undoLabel = "Undo" }: UndoToastOptions = {}
) {
  return new Promise<boolean>((resolve) => {
    toast(message, {
      description,
      duration: Math.max(duration, 4000),
      action: { label: undoLabel, onClick: () => resolve(false) },
      onAutoClose: () => resolve(true),
      onDismiss: () => resolve(true),
    })
  })
}

export { undoToast, type UndoToastOptions }
