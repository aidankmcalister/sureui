"use client"

import { KeyRoundIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome, useToggle } from "@/components/site/home/examples/outcome"

const keys = [
  { name: "Production", value: "sk_live_••••4f2a" },
  { name: "Staging", value: "sk_test_••••9c1e" },
  { name: "Preview", value: "sk_test_••••71b3" },
]

export function ApiKeys() {
  const revoked = useToggle()

  return (
    <Outcome
      done={revoked.count === keys.length}
      icon={<KeyRoundIcon />}
      title="Every key is revoked"
    >
      <div className="grid w-full divide-y">
        {keys.map((key) => (
          <div
            key={key.name}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {key.name}
                {revoked.has(key.name) && (
                  <Badge variant="outline">Revoked</Badge>
                )}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {key.value}
              </span>
            </div>
            {!revoked.has(key.name) && (
              <ConfirmButton
                gesture="hold"
                variant="destructive"
                size="sm"
                onConfirm={() => revoked.toggle(key.name)}
              >
                Hold to revoke
              </ConfirmButton>
            )}
          </div>
        ))}
      </div>
    </Outcome>
  )
}
