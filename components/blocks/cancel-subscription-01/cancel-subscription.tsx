"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"

type Status = "active" | "canceled" | "starter"

type CancelSubscriptionProps = {
  renewsOn?: string
  className?: string
}

function request() {
  return Promise.resolve()
}

function CancelSubscription({
  renewsOn = "October 29",
  className,
}: CancelSubscriptionProps) {
  const [status, setStatus] = React.useState<Status>("active")
  const { confirm, dialog } = useConfirm()

  function cancel() {
    confirm({
      title: "Cancel your Pro subscription?",
      description: `You keep Pro until ${renewsOn}, and you can keep it any time before then.`,
      consequences: (
        <Consequences
          title={`On ${renewsOn}`}
          variant="destructive"
          items={[
            { label: "Plan", from: "Pro", to: "Free" },
            {
              label: "Seats",
              from: 5,
              to: 1,
              names: ["Leo Park", "Ava Diaz", "Sam Lee", "Mia Chen"],
              description: "They lose access. Only you keep it.",
            },
            {
              label: "Projects",
              from: 12,
              to: 3,
              description: "The other 9 become read-only.",
            },
            { label: "Deployment history", from: "Unlimited", to: "7 days" },
          ]}
        />
      ),
      alternative: {
        label: "Switch to Starter instead",
        onSelect: async () => {
          await request()
          setStatus("starter")
        },
      },
      gesture: "click-again",
      cancelLabel: "Keep Pro",
      confirmLabel: "Cancel subscription",
      variant: "destructive",
      onConfirm: async () => {
        await request()
        setStatus("canceled")
      },
    })
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>
            {status === "starter" ? "Starter plan" : "Pro plan"}
          </CardTitle>
          {status === "canceled" && <Badge variant="secondary">Canceled</Badge>}
        </div>
        <CardDescription role="status">
          {status === "canceled"
            ? `Your access ends on ${renewsOn}. Nothing is charged after that.`
            : status === "starter"
              ? `You move to Starter, $8 per seat a month, on ${renewsOn}.`
              : `$20 per seat a month, 5 seats. Renews on ${renewsOn}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm">
        <p>5 of 5 seats used</p>
        <p className="text-muted-foreground">12 projects, unlimited history</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {status === "active" ? (
          <Button variant="outline" onClick={cancel}>
            Cancel subscription
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={async () => {
              await request()
              setStatus("active")
            }}
          >
            Keep Pro
          </Button>
        )}
      </CardFooter>
      {dialog}
    </Card>
  )
}

export { CancelSubscription, type CancelSubscriptionProps }
