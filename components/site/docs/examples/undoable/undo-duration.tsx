"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useLog } from "@/components/site/docs/preview"

const initialMembers = ["Maya Chen", "Leo Brandt", "Ines Duarte"]

export default function UndoableUndoDuration() {
  const log = useLog()
  const [members, setMembers] = React.useState(initialMembers)

  return (
    <ul className="w-full max-w-sm divide-y rounded-lg border text-sm">
      {members.map((member) => (
        <Undoable
          key={member}
          undo={10000}
          render={<li className="flex items-center gap-2 py-1.5 pr-1.5 pl-3" />}
          label={`Removed ${member}`}
          onConfirm={() => {
            setMembers((current) => current.filter((item) => item !== member))
            log(`Removed ${member}`)
          }}
          onCancel={() => log(`Undone, ${member} stays`)}
        >
          {({ remove }) => (
            <>
              <span className="flex-1 truncate">{member}</span>
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
