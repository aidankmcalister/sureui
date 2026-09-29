"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmMenuItemContextMenu() {
  const { deleteFile } = useActions()

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full max-w-xs items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click or long press here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ConfirmMenuItem
          menu="context"
          variant="destructive"
          onConfirm={deleteFile}
        >
          Delete
        </ConfirmMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
