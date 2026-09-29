"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmMenuItemErrors() {
  const { deleteFile, showError } = useActions({
    deleteFile: { wait: 1000, fail: "Network error" },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <ConfirmMenuItem
          variant="destructive"
          errorLabel="Couldn't delete. Retry"
          onConfirm={deleteFile}
          onConfirmError={showError}
        >
          Delete
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
