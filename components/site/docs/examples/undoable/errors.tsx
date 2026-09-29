"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useActions } from "@/components/site/docs/preview"

export default function UndoableErrors() {
  const { deleteFile, showError } = useActions({
    deleteFile: { wait: 1000, fail: "Network error" },
  })
  const [files, setFiles] = React.useState(["q3-report.pdf", "notes.md"])

  return (
    <ul className="w-full max-w-sm divide-y rounded-lg border text-sm">
      {files.map((file) => (
        <Undoable
          key={file}
          render={
            <li className="flex items-center justify-between py-1.5 pr-1.5 pl-3" />
          }
          label={`Deleted ${file}`}
          onConfirm={async () => {
            await deleteFile(file)
            setFiles((current) => current.filter((item) => item !== file))
          }}
          onConfirmError={showError}
        >
          {({ remove }) => (
            <>
              {file}
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
