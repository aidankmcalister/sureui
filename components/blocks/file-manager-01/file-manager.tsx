"use client"

import * as React from "react"
import {
  FileArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderOpenIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"
import { undoToast } from "@/components/ui/sureui/undo-toast"

type FileKind = "document" | "image" | "archive" | "spreadsheet" | "other"

type FileItem = {
  id: string
  name: string
  kind: FileKind
  size: string
  modified: string
  trashed?: string
}

type FileManagerProps = {
  initialFiles?: FileItem[]
  className?: string
}

const sampleFiles: FileItem[] = [
  {
    id: "file_1",
    name: "q3-report.pdf",
    kind: "document",
    size: "2.4 MB",
    modified: "2 hours ago",
  },
  {
    id: "file_2",
    name: "brand-assets.zip",
    kind: "archive",
    size: "18.1 MB",
    modified: "yesterday",
  },
  {
    id: "file_3",
    name: "meeting-notes.md",
    kind: "document",
    size: "4 KB",
    modified: "Monday",
  },
  {
    id: "file_4",
    name: "launch-hero.png",
    kind: "image",
    size: "3.2 MB",
    modified: "Sep 18",
  },
  {
    id: "file_5",
    name: "budget-2026.xlsx",
    kind: "spreadsheet",
    size: "96 KB",
    modified: "Sep 12",
  },
  {
    id: "file_6",
    name: "old-logo.svg",
    kind: "image",
    size: "12 KB",
    modified: "Jun 3",
    trashed: "3 days ago",
  },
  {
    id: "file_7",
    name: "draft-v1.docx",
    kind: "document",
    size: "220 KB",
    modified: "May 28",
    trashed: "last week",
  },
]

const icons: Record<FileKind, React.ReactNode> = {
  document: <FileTextIcon />,
  image: <FileImageIcon />,
  archive: <FileArchiveIcon />,
  spreadsheet: <FileSpreadsheetIcon />,
  other: <FileIcon />,
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function summary(files: FileItem[]) {
  return files.length === 1 ? files[0].name : `${files.length} files`
}

function FileManager({
  initialFiles = sampleFiles,
  className,
}: FileManagerProps) {
  const [files, setFiles] = React.useState(initialFiles)
  const [selected, setSelected] = React.useState<string[]>([])
  const [view, setView] = React.useState("files")

  const active = files.filter((file) => !file.trashed)
  const trash = files.filter((file) => file.trashed)
  const allSelected = active.length > 0 && selected.length === active.length

  function setTrashed(ids: string[], trashed: string | undefined) {
    setFiles((prev) =>
      prev.map((file) => (ids.includes(file.id) ? { ...file, trashed } : file))
    )
  }

  async function moveToTrash() {
    const ids = selected
    const moved = active.filter((file) => ids.includes(file.id))
    setTrashed(ids, "just now")
    setSelected([])
    const committed = await undoToast(`Moved ${summary(moved)} to trash`, {
      description: "They stay in Trash until you empty it.",
    })
    if (committed) {
      await request()
    } else {
      setTrashed(ids, undefined)
    }
  }

  async function emptyTrash() {
    await request()
    setFiles((prev) => prev.filter((file) => !file.trashed))
  }

  return (
    <Card className={cn("w-full", className)}>
      <Tabs
        value={view}
        onValueChange={setView}
        className="gap-(--card-spacing)"
      >
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>Shared with the Design team.</CardDescription>
          <CardAction>
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="trash">
                Trash
                {trash.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 px-1 tabular-nums"
                  >
                    {trash.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TabsContent value="files" className="grid gap-3">
            <div className="flex min-h-8 items-center justify-between gap-3">
              <label className="flex items-center gap-3 pl-3 text-sm text-muted-foreground sm:pl-4">
                <Checkbox
                  checked={allSelected}
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
                <Trash2Icon data-icon="inline-start" />
                Move to trash
              </Button>
            </div>
            {active.length === 0 ? (
              <Empty className="border py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderOpenIcon />
                  </EmptyMedia>
                  <EmptyTitle>No files</EmptyTitle>
                  <EmptyDescription>
                    Everything is in the trash.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul aria-label="Files" className="divide-y rounded-lg border">
                {active.map((file) => (
                  <li key={file.id}>
                    <label className="flex items-center gap-3 px-3 py-2.5 has-data-checked:bg-muted/50 sm:px-4">
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
                      <span
                        aria-hidden
                        className="text-muted-foreground [&_svg]:size-4"
                      >
                        {icons[file.kind]}
                      </span>
                      <span className="grid min-w-0 flex-1">
                        <span className="truncate font-medium">
                          {file.name}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {file.size} · Edited {file.modified}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="trash" className="grid gap-3">
            {trash.length > 0 && (
              <div className="flex min-h-8 items-center justify-between gap-3">
                <p className="text-sm text-pretty text-muted-foreground">
                  Restore a file to put it back. Emptying the trash deletes
                  these for good.
                </p>
                <ConfirmDialog
                  title="Empty the trash?"
                  description="These files are deleted for good. Nobody on the team can restore them."
                  consequences={
                    <Consequences
                      title="What gets deleted"
                      variant="destructive"
                      items={[
                        {
                          icon: <FileIcon />,
                          label: trash.length === 1 ? "file" : "files",
                          count: trash.length,
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
                  <Button variant="destructive" size="sm" className="shrink-0">
                    Empty trash
                  </Button>
                </ConfirmDialog>
              </div>
            )}
            {trash.length === 0 ? (
              <Empty className="border py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Trash2Icon />
                  </EmptyMedia>
                  <EmptyTitle>Trash is empty</EmptyTitle>
                  <EmptyDescription>
                    Files you move to trash show up here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul aria-label="Trash" className="divide-y rounded-lg border">
                {trash.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 px-3 py-2.5 sm:px-4"
                  >
                    <span
                      aria-hidden
                      className="text-muted-foreground [&_svg]:size-4"
                    >
                      {icons[file.kind]}
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="truncate text-muted-foreground">
                        {file.size} · Trashed {file.trashed}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Restore ${file.name}`}
                      onClick={() => setTrashed([file.id], undefined)}
                    >
                      <Undo2Icon data-icon="inline-start" />
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

export { FileManager, type FileItem, type FileKind, type FileManagerProps }
