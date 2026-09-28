"use client"

import * as React from "react"
import { FileIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Outcome } from "@/components/site/home/examples/outcome"

const files = [
  { name: "q3-report.pdf", size: "2.4 MB", modified: "2h ago" },
  { name: "brand-assets.zip", size: "18.1 MB", modified: "Yesterday" },
  { name: "meeting-notes.md", size: "4 KB", modified: "Monday" },
]

export function Files() {
  const [selected, setSelected] = React.useState(files.map((file) => file.name))
  const [trashed, setTrashed] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)

  return (
    <Outcome
      done={trashed.length === files.length}
      icon={<Trash2Icon />}
      title="Moved to trash"
      onReset={() => {
        setTrashed([])
        setSelected(files.map((file) => file.name))
      }}
    >
      <div className="group grid w-full gap-3">
        <div className="divide-y text-sm">
          {files.map((file) => (
            <label
              key={file.name}
              className={cn(
                "flex items-center gap-3 py-2 first:pt-0",
                trashed.includes(file.name) &&
                  "text-muted-foreground line-through",
                selected.includes(file.name) &&
                  "group-has-data-[state=undo]:text-muted-foreground group-has-data-[state=undo]:line-through"
              )}
            >
              <Checkbox
                checked={selected.includes(file.name)}
                disabled={pending || trashed.includes(file.name)}
                onCheckedChange={(on) =>
                  setSelected((prev) =>
                    on
                      ? [...prev, file.name]
                      : prev.filter((name) => name !== file.name)
                  )
                }
              />
              <FileIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {file.size}
              </span>
              <span className="w-20 text-right text-muted-foreground">
                {file.modified}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <ConfirmButton
            undo
            variant="outline"
            disabled={selected.length === 0}
            onClick={() => setPending(true)}
            onCancel={() => setPending(false)}
            onConfirm={() => {
              setPending(false)
              setTrashed((prev) => [...prev, ...selected])
              setSelected([])
            }}
          >
            <Trash2Icon />
            Move {selected.length} to trash
          </ConfirmButton>
        </div>
      </div>
    </Outcome>
  )
}
