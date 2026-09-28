"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Details, Outcome } from "@/components/site/home/examples/outcome"

const preferences = { Theme: "Dark", Alerts: "Mentions", Keys: "Custom" }

export function Preferences() {
  const [reset, setReset] = React.useState(false)

  return (
    <Outcome
      done={reset}
      icon={<RotateCcwIcon />}
      title="Preferences reset"
      onReset={() => setReset(false)}
    >
      <div className="grid w-full gap-3 text-sm">
        <Details rows={Object.entries(preferences)} />
        <ConfirmButton
          gesture="hold"
          duration={2000}
          variant="outline"
          onConfirm={() => setReset(true)}
        >
          Hold to reset
        </ConfirmButton>
      </div>
    </Outcome>
  )
}
