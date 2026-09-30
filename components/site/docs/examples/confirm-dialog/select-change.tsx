"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogSelectChange() {
  const { changeRole } = useActions()
  const [role, setRole] = React.useState("Admin")
  const { confirm, dialog } = useConfirm()

  async function change(next: string | null) {
    if (!next || next === role) return
    const confirmed = await confirm({
      title: `Make Ava Diaz a ${next}?`,
      description: `Ava is ${role} now.`,
      confirmLabel: `Make ${next}`,
    })
    if (!confirmed) return
    setRole(next)
    changeRole(next)
  }

  return (
    <>
      <Select value={role} onValueChange={change}>
        <SelectTrigger aria-label="Role" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Admin">Admin</SelectItem>
          <SelectItem value="Member">Member</SelectItem>
          <SelectItem value="Viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      {dialog}
    </>
  )
}
