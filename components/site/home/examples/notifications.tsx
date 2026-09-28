"use client"

import * as React from "react"
import { BellOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome } from "@/components/site/home/examples/outcome"

const notifications = [
  { title: "Nora commented on Q4 roadmap", time: "5m" },
  { title: "Build #1841 passed on main", time: "1h" },
  { title: "Theo invited you to Research", time: "3h" },
]

export function Notifications() {
  const [cleared, setCleared] = React.useState(false)

  return (
    <Outcome done={cleared} icon={<BellOffIcon />} title="All caught up">
      <div className="group grid w-full gap-3 text-sm">
        <ul className="divide-y">
          {notifications.map((notification) => (
            <li
              key={notification.title}
              className={cn(
                "flex items-center justify-between gap-3 py-2 first:pt-0",
                "group-has-data-[state=undo]:text-muted-foreground group-has-data-[state=undo]:line-through"
              )}
            >
              <span className="truncate">{notification.title}</span>
              <span className="text-muted-foreground">{notification.time}</span>
            </li>
          ))}
        </ul>
        <ConfirmButton
          undo
          variant="outline"
          className="justify-self-end"
          onConfirm={() => setCleared(true)}
        >
          Clear all
        </ConfirmButton>
      </div>
    </Outcome>
  )
}
