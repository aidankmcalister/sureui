"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

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
      <DialogTrigger render={<Button size="sm" />}>Create key</DialogTrigger>
      <DialogContent showCloseButton={created === null}>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy your new key</DialogTitle>
              <DialogDescription>
                You won&apos;t see the secret for {created.name} again. Store it
                somewhere safe.
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
                Name it after the service that will use it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={nameId}>Name</Label>
              <Input
                id={nameId}
                value={name}
                placeholder="Billing worker"
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
