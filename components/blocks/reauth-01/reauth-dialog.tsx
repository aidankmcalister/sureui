"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Verify = (code: string) => Promise<boolean>

type ReauthOptions = {
  verify: Verify
  rememberFor: number
  hint?: React.ReactNode
}

type ReauthDialogProps = {
  open: boolean
  verify: Verify
  hint?: React.ReactNode
  onVerified: () => void
  onCancel: () => void
}

function ReauthDialog({
  open,
  verify,
  hint,
  onVerified,
  onCancel,
}: ReauthDialogProps) {
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const codeId = React.useId()
  const noteId = React.useId()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.")
      return
    }
    setPending(true)
    setError("")
    let ok = false
    try {
      ok = await verify(code)
      if (!ok) setError("That code didn't work. Try again.")
    } catch {
      setError("We couldn't check that code. Try again.")
    } finally {
      setPending(false)
    }
    if (ok) onVerified()
    else requestAnimationFrame(() => inputRef.current?.select())
  }

  return (
    <Dialog
      open={open}
      disablePointerDismissal={pending}
      onOpenChange={(next) => {
        if (!next && !pending) onCancel()
      }}
      onOpenChangeComplete={(next) => {
        if (next) return
        setCode("")
        setError("")
      }}
    >
      <DialogContent initialFocus={inputRef}>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Confirm it&apos;s you</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={codeId}>Code</Label>
            <Input
              ref={inputRef}
              id={codeId}
              value={code}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              readOnly={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error || hint ? noteId : undefined}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, ""))
                setError("")
              }}
            />
            {error ? (
              <p id={noteId} role="alert" className="text-destructive">
                {error}
              </p>
            ) : (
              hint && (
                <p id={noteId} className="text-muted-foreground">
                  {hint}
                </p>
              )
            )}
          </div>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={pending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Verifying…" : "Verify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function useReauth({ verify, rememberFor, hint }: ReauthOptions) {
  const [open, setOpen] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const verifiedRef = React.useRef(false)
  const resolver = React.useRef<((ok: boolean) => void) | null>(null)

  React.useEffect(() => {
    if (!verified) return
    const timer = setTimeout(() => {
      verifiedRef.current = false
      setVerified(false)
    }, rememberFor)
    return () => clearTimeout(timer)
  }, [verified, rememberFor])

  React.useEffect(() => () => resolver.current?.(false), [])

  const reauthenticate = React.useCallback(() => {
    if (verifiedRef.current) return Promise.resolve(true)
    resolver.current?.(false)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  function settle(ok: boolean) {
    resolver.current?.(ok)
    resolver.current = null
    if (ok) {
      verifiedRef.current = true
      setVerified(true)
    }
    setOpen(false)
  }

  const dialog = (
    <ReauthDialog
      open={open}
      verify={verify}
      hint={hint}
      onVerified={() => settle(true)}
      onCancel={() => settle(false)}
    />
  )

  return { reauthenticate, verified, dialog }
}

export { useReauth, type ReauthOptions, type Verify }
