"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useUnsavedChanges } from "@/components/ui/sureui/unsaved-changes"

type Settings = { name: string; slug: string; public: boolean }

type SettingsSaveBarProps = {
  className?: string
}

const pages = ["General", "Members", "Billing"]

const descriptions: Record<string, string> = {
  Members: "Invite people and choose what they can do.",
  Billing: "Your plan, invoices and payment method.",
}

function save() {
  return new Promise((resolve) => setTimeout(resolve, 800))
}

function SettingsSaveBar({ className }: SettingsSaveBarProps) {
  const [page, setPage] = React.useState(pages[0])
  const [saved, setSaved] = React.useState<Settings>({
    name: "Acme",
    slug: "acme",
    public: false,
  })
  const [draft, setDraft] = React.useState(saved)
  const [saving, setSaving] = React.useState(false)
  const prefixRef = React.useRef<HTMLSpanElement>(null)
  const urlRef = React.useRef<HTMLInputElement>(null)
  const changed =
    draft.name !== saved.name ||
    draft.slug !== saved.slug ||
    draft.public !== saved.public

  async function onSave() {
    setSaving(true)
    await save()
    setSaved(draft)
    setSaving(false)
  }

  const { confirmLeave, dialog } = useUnsavedChanges({
    when: changed,
    onSave,
    onDiscard: () => setDraft(saved),
  })

  React.useLayoutEffect(() => {
    const prefix = prefixRef.current
    const input = urlRef.current
    if (!prefix || !input) return
    const fit = () => {
      input.style.paddingLeft = `${prefix.offsetWidth + 10}px`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [page])

  async function open(next: string) {
    if (next !== page && (await confirmLeave())) setPage(next)
  }

  return (
    <Card className={cn("w-full gap-0 overflow-hidden py-0", className)}>
      <nav className="flex gap-1 border-b p-2">
        {pages.map((item) => (
          <Button
            key={item}
            variant={item === page ? "secondary" : "ghost"}
            size="sm"
            aria-current={item === page ? "page" : undefined}
            onClick={() => open(item)}
          >
            {item}
          </Button>
        ))}
      </nav>
      {page === "General" ? (
        <>
          <CardHeader className="py-6">
            <CardTitle>General</CardTitle>
            <CardDescription>How your team appears to others.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-url">Team URL</Label>
              <div className="relative">
                <span
                  ref={prefixRef}
                  id="team-url-prefix"
                  className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-base text-muted-foreground md:text-sm"
                >
                  acme.app/
                </span>
                <Input
                  ref={urlRef}
                  id="team-url"
                  aria-describedby="team-url-prefix"
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft({ ...draft, slug: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <Label htmlFor="team-public">Public profile</Label>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can see your team and its projects.
                </p>
              </div>
              <Switch
                id="team-public"
                checked={draft.public}
                onCheckedChange={(checked) =>
                  setDraft({ ...draft, public: checked })
                }
              />
            </div>
          </CardContent>
        </>
      ) : (
        <CardHeader className="py-6">
          <CardTitle>{page}</CardTitle>
          <CardDescription>{descriptions[page]}</CardDescription>
        </CardHeader>
      )}
      {changed && (
        <CardFooter
          role="region"
          aria-label="Unsaved changes"
          className="sticky bottom-0 flex-wrap justify-between gap-3 border-t bg-muted/50 py-3"
        >
          <p className="text-sm">You have unsaved changes</p>
          <div className="flex gap-2">
            <ConfirmButton
              gesture="click-again"
              variant="ghost"
              size="sm"
              disabled={saving}
              onConfirm={() => setDraft(saved)}
            >
              Discard
            </ConfirmButton>
            <Button size="sm" disabled={saving} onClick={onSave}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardFooter>
      )}
      {dialog}
    </Card>
  )
}

export { SettingsSaveBar, type SettingsSaveBarProps }
