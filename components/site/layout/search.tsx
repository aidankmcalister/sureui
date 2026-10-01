"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { CornerDownLeftIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { track } from "@/lib/site/analytics"
import { search, type SearchEntry } from "@/lib/site/search"
import { siteButton } from "@/components/site/ui/button"

function clip(query: string) {
  return query.trim().slice(0, 60)
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

export function Search({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLUListElement>(null)
  const results = React.useMemo(() => search(entries, query), [entries, query])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTyping(event.target))
      if (!shortcut) return
      event.preventDefault()
      setOpen((value) => !value)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  React.useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  function go(entry: SearchEntry | undefined) {
    if (!entry) return
    track("search-select", { query: clip(query), href: entry.href })
    setOpen(false)
    router.push(entry.href)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive((index) => (index + step + results.length) % results.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      go(results[active])
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && query.trim() && results.length === 0) {
          track("search-miss", { query: clip(query) })
        }
        setOpen(next)
        if (next) {
          setQuery("")
          setActive(0)
        }
      }}
    >
      <DialogPrimitive.Trigger
        aria-label="Search docs"
        className={siteButton({
          variant: "ghost",
          size: "icon",
          className:
            "lg:w-44 lg:justify-between lg:border lg:border-(--rule) lg:bg-(--well) lg:px-2.5 lg:text-[11px] lg:hover:border-(--ink-label)",
        })}
      >
        <span className="flex items-center gap-2">
          <SearchIcon />
          <span className="max-lg:hidden">Search</span>
        </span>
        <kbd className="font-mono text-[11px] text-(--ink-label) max-lg:hidden">
          ⌘K
        </kbd>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-x-3 top-[12vh] z-50 mx-auto flex max-h-[70vh] max-w-xl flex-col border border-(--rule) bg-(--paper) text-(--ink) shadow-2xl transition-opacity duration-150 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
          <DialogPrimitive.Title className="sr-only">
            Search docs
          </DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-(--rule) px-4">
            <SearchIcon className="size-4 shrink-0 text-(--ink-label)" />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              aria-activedescendant={
                results[active] ? `search-result-${active}` : undefined
              }
              aria-label="Search docs"
              placeholder="Search components, props, guides"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-(--ink-label)"
            />
          </div>
          <ul
            ref={listRef}
            id="search-results"
            role="listbox"
            aria-label="Results"
            className="overflow-y-auto p-1.5"
          >
            {results.length === 0 && (
              <li className="grid gap-1 px-3 py-6 text-center text-sm text-(--ink-muted)">
                <span>No results for “{query}”</span>
                <span>
                  Not sure what you need?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      go({
                        href: "/docs/choosing-a-confirmation",
                        title: "Choosing a confirmation",
                        text: "",
                      })
                    }
                    className="font-medium text-(--ink) underline decoration-(--rule) underline-offset-4 hover:decoration-(--ink)"
                  >
                    Choosing a confirmation
                  </button>
                </span>
              </li>
            )}
            {results.map((entry, index) => (
              <li
                key={entry.href}
                id={`search-result-${index}`}
                data-index={index}
                role="option"
                aria-selected={index === active}
                onPointerMove={() => setActive(index)}
                onClick={() => go(entry)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3 py-2",
                  index === active && "bg-(--well)"
                )}
              >
                <span className="min-w-0 flex-1">
                  {entry.page && (
                    <span className="block truncate font-mono text-[11px] tracking-widest text-(--ink-label) uppercase">
                      {entry.page}
                    </span>
                  )}
                  <span className="block truncate text-sm">{entry.title}</span>
                  {!entry.page && entry.text && (
                    <span className="block truncate text-[13px] text-(--ink-muted)">
                      {entry.text}
                    </span>
                  )}
                </span>
                {index === active && (
                  <CornerDownLeftIcon className="size-3.5 shrink-0 text-(--ink-label)" />
                )}
              </li>
            ))}
          </ul>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
