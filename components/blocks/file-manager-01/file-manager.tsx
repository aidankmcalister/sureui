"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"
import { undoToast } from "@/components/ui/sureui/undo-toast"

type FileItem = {
  id: string
  name: string
  size: string
  trashed?: boolean
}

type FileManagerProps = {
  initialFiles?: FileItem[]
  className?: string
}

const sampleFiles: FileItem[] = [
  { id: "file_1", name: "q3-report.pdf", size: "2.4 MB" },
  { id: "file_2", name: "meeting-notes.md", size: "4 KB" },
  { id: "file_3", name: "launch-hero.png", size: "3.2 MB" },
  { id: "file_4", name: "old-logo.svg", size: "12 KB", trashed: true },
]

function request() {
  return Promise.resolve()
}

function FileManager({
  initialFiles = sampleFiles,
  className,
}: FileManagerProps) {
  const [files, setFiles] = React.useState(initialFiles)
  const [selected, setSelected] = React.useState<string[]>([])

  const active = files.filter((file) => !file.trashed)
  const trash = files.filter((file) => file.trashed)

  function setTrashed(ids: string[], trashed: boolean) {
    setFiles((prev) =>
      prev.map((file) => (ids.includes(file.id) ? { ...file, trashed } : file))
    )
  }

  async function moveToTrash() {
    const ids = selected
    const label =
      ids.length === 1
        ? active.find((file) => file.id === ids[0])?.name
        : `${ids.length} files`
    setTrashed(ids, true)
    setSelected([])
    if (await undoToast(`Moved ${label} to trash`)) await request()
    else setTrashed(ids, false)
  }

  async function emptyTrash() {
    await request()
    setFiles((prev) => prev.filter((file) => !file.trashed))
  }

  return (
    <Card className={cn("w-full", className)}>
      <Tabs defaultValue="files" className="gap-(--card-spacing)">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardAction>
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="trash">
                Trash{trash.length > 0 && ` (${trash.length})`}
              </TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TabsContent value="files" className="divide-y">
            <div className="flex items-center justify-between gap-3 pb-3">
              <label className="flex items-center gap-3 text-muted-foreground">
                <Checkbox
                  checked={
                    active.length > 0 && selected.length === active.length
                  }
                  disabled={active.length === 0}
                  onCheckedChange={(on) =>
                    setSelected(on ? active.map((file) => file.id) : [])
                  }
                />
                {selected.length > 0
                  ? `${selected.length} selected`
                  : "Select all"}
              </label>
              <Button
                variant="outline"
                size="sm"
                disabled={selected.length === 0}
                onClick={moveToTrash}
              >
                Move to trash
              </Button>
            </div>
            {active.length === 0 ? (
              <p className="pt-3 text-muted-foreground">No files</p>
            ) : (
              <ul aria-label="Files" className="divide-y">
                {active.map((file) => (
                  <li key={file.id} className="py-3 last:pb-0">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={selected.includes(file.id)}
                        onCheckedChange={(on) =>
                          setSelected((prev) =>
                            on
                              ? [...prev, file.id]
                              : prev.filter((id) => id !== file.id)
                          )
                        }
                      />
                      <span className="flex-1 truncate font-medium">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {file.size}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="trash" className="divide-y">
            {trash.length === 0 ? (
              <p className="text-muted-foreground">Trash is empty</p>
            ) : (
              <>
                <div className="flex justify-end pb-3">
                  <ConfirmDialog
                    title="Empty the trash?"
                    description="These files are deleted. It can't be undone."
                    consequences={
                      <Consequences
                        title="What gets deleted"
                        variant="destructive"
                        items={[
                          {
                            label: "Files",
                            names: trash.map((file) => file.name),
                          },
                        ]}
                      />
                    }
                    phrase="empty trash"
                    confirmLabel="Empty trash"
                    variant="destructive"
                    onConfirm={emptyTrash}
                  >
                    <Button variant="destructive" size="sm">
                      Empty trash
                    </Button>
                  </ConfirmDialog>
                </div>
                <ul aria-label="Trash" className="divide-y">
                  {trash.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center gap-3 py-3 last:pb-0"
                    >
                      <span className="flex-1 truncate font-medium">
                        {file.name}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Restore ${file.name}`}
                        onClick={() => setTrashed([file.id], false)}
                      >
                        Restore
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

export { FileManager, type FileItem, type FileManagerProps }
