"use client"

import { MonitorSmartphoneIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome, useToggle } from "@/components/site/home/examples/outcome"

const sessions = [
  { device: "iPhone 15", detail: "Safari · Boston · 2h ago" },
  { device: "Windows desktop", detail: "Firefox · Tulsa · Yesterday" },
  { device: "Macbook Air", detail: "Firefox · Boston · Last week" },
]

export function Sessions() {
  const signedOut = useToggle()

  return (
    <Outcome
      done={signedOut.count === sessions.length}
      icon={<MonitorSmartphoneIcon />}
      title="Only this device is signed in"
    >
      <div className="grid w-full divide-y">
        {sessions.map((session) => (
          <div
            key={session.device}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {session.device}
                {signedOut.has(session.device) && (
                  <Badge variant="outline">Signed out</Badge>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.detail}
              </span>
            </div>
            {!signedOut.has(session.device) && (
              <ConfirmButton
                gesture="hold"
                variant="destructive"
                size="sm"
                onConfirm={() => signedOut.toggle(session.device)}
              >
                Hold to sign out
              </ConfirmButton>
            )}
          </div>
        ))}
      </div>
    </Outcome>
  )
}
