"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmMenuItemDemo() {
  const log = useLog()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuItem onClick={() => log("Renaming launch-plan.pdf")}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmMenuItem
          variant="destructive"
          onConfirm={() => log("Deleted launch-plan.pdf")}
          onCancel={() => log("Disarmed, nothing deleted")}
        >
          Delete
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
