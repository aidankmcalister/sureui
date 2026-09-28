"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchDialog() {
  const log = useLog()

  return (
    <div className="flex items-center gap-2">
      <ConfirmSwitch
        id="require-sso"
        gesture="dialog"
        title="Stop requiring single sign-on?"
        description="All 48 members will be able to sign in with a password."
        confirmLabel="Stop requiring SSO"
        variant="destructive"
        defaultChecked
        onConfirm={(on) => log(on ? "SSO required" : "SSO no longer required")}
        onCancel={() => log("Kept SSO required")}
      />
      <Label htmlFor="require-sso">Require single sign-on</Label>
    </div>
  )
}
