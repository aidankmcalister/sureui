"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function UndoableUndoDuration() {
  const { removeMember } = useActions()
  const control = useControl()
  const [members, setMembers] = React.useState(["Maya Chen", "Leo Brandt"])

  return (
    <ul className="w-full max-w-sm divide-y rounded-lg border text-sm">
      {members.map((member) => (
        <Undoable
          key={member}
          undo={control("undo", 10000)}
          render={
            <li className="flex items-center justify-between py-1.5 pr-1.5 pl-3" />
          }
          label={`Removed ${member}`}
          onConfirm={() => {
            removeMember(member)
            setMembers((current) => current.filter((item) => item !== member))
          }}
        >
          {({ remove }) => (
            <>
              {member}
              <Button variant="ghost" size="sm" onClick={remove}>
                Remove
              </Button>
            </>
          )}
        </Undoable>
      ))}
    </ul>
  )
}
