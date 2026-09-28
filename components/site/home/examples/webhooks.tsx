"use client"

import * as React from "react"
import { WebhookIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { Outcome } from "@/components/site/home/examples/outcome"

const initialWebhooks = [
  { name: "Orders", url: "hooks.acme.dev/orders" },
  { name: "Refunds", url: "hooks.acme.dev/refunds" },
  { name: "Signups", url: "hooks.acme.dev/signups" },
]

export function Webhooks() {
  const [webhooks, setWebhooks] = React.useState(initialWebhooks)

  return (
    <Outcome
      done={webhooks.length === 0}
      icon={<WebhookIcon />}
      title="No webhooks left"
    >
      <ul className="grid w-full divide-y text-sm">
        {webhooks.map((webhook) => (
          <Undoable
            key={webhook.name}
            render={
              <li className="flex items-center gap-3 py-2 first:pt-0 last:pb-0" />
            }
            label={`Removed ${webhook.name}`}
            onConfirm={() =>
              setWebhooks((prev) =>
                prev.filter((item) => item.name !== webhook.name)
              )
            }
          >
            {({ remove }) => (
              <>
                <div className="grid flex-1 gap-0.5">
                  <span className="font-medium">{webhook.name}</span>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {webhook.url}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={remove}>
                  Remove
                </Button>
              </>
            )}
          </Undoable>
        ))}
      </ul>
    </Outcome>
  )
}
