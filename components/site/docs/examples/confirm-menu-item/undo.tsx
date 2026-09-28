"use client"

import { EllipsisIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmMenuItemUndo() {
  const log = useLog()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Thread actions" />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <ConfirmMenuItem
          gesture="click"
          undo
          onConfirm={() => log("Archived the thread")}
          onCancel={() => log("Undone, nothing archived")}
        >
          Archive
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
