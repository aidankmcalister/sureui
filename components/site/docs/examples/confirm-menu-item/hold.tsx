"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmMenuItemHold() {
  const { revokeKey } = useActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <ConfirmMenuItem gesture="hold" onConfirm={revokeKey}>
          Hold to revoke
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
