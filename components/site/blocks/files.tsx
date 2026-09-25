"use client"

import * as React from "react"
import { FileIcon } from "lucide-react"

import { undoToast } from "@/components/ui/sureui/undo-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const files = ["q3-report.pdf", "brand-assets.zip", "meeting-notes.md"]

export function Files() {
  const [trashed, setTrashed] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared files</CardTitle>
        <CardDescription>
          {trashed ? "Moved to trash." : `${files.length} files`}
        </CardDescription>
        <CardAction>
          {trashed ? (
            <Button variant="ghost" size="sm" onClick={() => setTrashed(false)}>
              Reset
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setTrashed(true)
                setTrashed(
                  await undoToast(`Moved ${files.length} files to trash`)
                )
              }}
            >
              Move to trash
            </Button>
          )}
        </CardAction>
      </CardHeader>
      {!trashed && (
        <CardContent className="grid gap-3">
          {files.map((file) => (
            <span key={file} className="flex items-center gap-2">
              <FileIcon className="size-4 text-muted-foreground" />
              {file}
            </span>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
