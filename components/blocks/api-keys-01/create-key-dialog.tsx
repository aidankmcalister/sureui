"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CreatedKey = {
  name: string
  secret: string
}

type CreateKeyDialogProps = {
  onCreate: (name: string) => Promise<CreatedKey>
}

function CreateKeyDialog({ onCreate }: CreateKeyDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [created, setCreated] = React.useState<CreatedKey | null>(null)
  const [copied, setCopied] = React.useState(false)
  const nameId = React.useId()
  const secretId = React.useId()

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  function reset() {
    setName("")
    setCreated(null)
    setCopied(false)
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || pending) return
    setPending(true)
    try {
      setCreated(await onCreate(name.trim()))
    } finally {
      setPending(false)
    }
  }

  async function copy() {
    if (!created) return
    await navigator.clipboard.writeText(created.secret)
    setCopied(true)
  }

  return (
    <Dialog
      open={open}
      disablePointerDismissal={created !== null || pending}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
      }}
      onOpenChangeComplete={(next) => {
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon data-icon="inline-start" />
        Create key
      </DialogTrigger>
      <DialogContent showCloseButton={created === null}>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy your new key</DialogTitle>
              <DialogDescription>
                This is the only time the secret for {created.name} is shown.
                Store it somewhere safe before you close this.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={secretId}>Secret key</Label>
              <div className="flex gap-2">
                <Input
                  id={secretId}
                  readOnly
                  value={created.secret}
                  className="font-mono text-xs"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={copied ? "Copied" : "Copy secret key"}
                  onClick={copy}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
              </div>
              <p className="flex items-start gap-2 text-muted-foreground">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                You won&apos;t see this secret again. If you lose it, revoke the
                key and create a new one.
              </p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={create} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Name the key after the service that will use it, so you know
                what breaks if you revoke it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={nameId}>Name</Label>
              <Input
                id={nameId}
                value={name}
                placeholder="e.g. Billing worker"
                autoComplete="off"
                readOnly={pending}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" />}
                disabled={pending}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={!name.trim() || pending}>
                {pending ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { CreateKeyDialog, type CreateKeyDialogProps, type CreatedKey }
