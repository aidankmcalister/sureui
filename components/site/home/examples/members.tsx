"use client"

import { UserMinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome, useToggle } from "@/components/site/home/examples/outcome"

const people = [
  { name: "Leo Park", initials: "LP", role: "Editor" },
  { name: "Ava Diaz", initials: "AD", role: "Viewer" },
  { name: "Sam Lee", initials: "SL", role: "Editor" },
]

export function Members() {
  const removed = useToggle()

  return (
    <Outcome
      done={removed.count === people.length}
      icon={<UserMinusIcon />}
      title="Everyone was removed"
    >
      <div className="grid w-full gap-1">
        {people.map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0"
          >
            <Avatar size="sm">
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "grid flex-1 text-sm",
                removed.has(person.name) && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  removed.has(person.name) && "line-through"
                )}
              >
                {person.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {removed.has(person.name) ? "Removed" : person.role}
              </span>
            </div>
            {!removed.has(person.name) && (
              <ConfirmButton
                gesture="click-again"
                variant="outline"
                size="sm"
                confirmLabel="Are you sure?"
                onConfirm={() => removed.toggle(person.name)}
              >
                Remove
              </ConfirmButton>
            )}
          </div>
        ))}
      </div>
    </Outcome>
  )
}
