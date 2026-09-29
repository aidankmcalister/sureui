"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmMenuItemDemo() {
  const { renameFile, deleteFile } = useActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuItem onClick={renameFile}>Rename</DropdownMenuItem>
        <ConfirmMenuItem variant="destructive" onConfirm={deleteFile}>
          Delete
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
