"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmMenuItemHold() {
  const log = useLog()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <ConfirmMenuItem
          gesture="hold"
          variant="destructive"
          onConfirm={() => log("Revoked the production key")}
          onCancel={() => log("Let go early, nothing revoked")}
        >
          Hold to revoke
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
