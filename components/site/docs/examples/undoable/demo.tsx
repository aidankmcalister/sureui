"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useLog } from "@/components/site/docs/preview"

const initialFiles = ["q3-report.pdf", "brand-assets.zip", "meeting-notes.md"]

export default function UndoableDemo() {
  const log = useLog()
  const [files, setFiles] = React.useState(initialFiles)

  if (files.length === 0) {
    return (
      <Button variant="outline" onClick={() => setFiles(initialFiles)}>
        Reset
      </Button>
    )
  }

  return (
    <ul className="w-full max-w-sm divide-y rounded-lg border text-sm">
      {files.map((file) => (
        <Undoable
          key={file}
          render={<li className="flex items-center gap-2 py-1.5 pr-1.5 pl-3" />}
          label={`Deleted ${file}`}
          onConfirm={() => {
            setFiles((current) => current.filter((item) => item !== file))
            log(`Deleted ${file}`)
          }}
          onCancel={() => log(`Undone, ${file} kept`)}
        >
          {({ remove }) => (
            <>
              <span className="flex-1 truncate">{file}</span>
              <Button variant="ghost" size="sm" onClick={remove}>
                Delete
              </Button>
            </>
          )}
        </Undoable>
      ))}
    </ul>
  )
}
