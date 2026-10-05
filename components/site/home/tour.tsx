"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  scenes,
  type Cursor,
  type Scene,
} from "@/components/site/home/tour-scenes"

type Point = { x: number; y: number }

async function estimate(scene: Scene) {
  let total = 500
  const add = (ms: number) => {
    total += ms
  }
  await scene.run({
    moveTo: async () => add(850),
    press: async (_, ms = 1450) => add(ms),
    click: async () => add(190),
    type: async (_, text) => add(text.length * 55),
    wait: async (ms) => add(ms),
    find: () => null,
    until: async () => {
      add(1200)
      return null
    },
  })
  return total
}

function Arrow() {
  return (
    <svg
      viewBox="2 1.5 18 20.5"
      className="h-[23px] w-5 overflow-visible drop-shadow-[0_3px_5px_rgb(0_0_0/0.45)]"
    >
      <path
        d="M2 1.5v16.2l4.3-4.1 2.9 6.6 2.9-1.3-2.9-6.5h6.1z"
        fill="white"
        stroke="#0b0b0b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Tour() {
  const [index, setIndex] = React.useState(0)
  const [round, setRound] = React.useState(0)
  const [leaving, setLeaving] = React.useState(false)
  const [length, setLength] = React.useState(0)
  const [last, setLast] = React.useState<{ text: string; id: number }>()
  const [cursor, setCursor] = React.useState({
    x: 0,
    y: 0,
    ms: 0,
    down: false,
    shown: false,
  })
  const [pulse, setPulse] = React.useState<Point & { id: number }>()
  const boxRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const posRef = React.useRef<Point>({ x: 0, y: 0 })
  const shownRef = React.useRef(false)

  const scene = scenes[index]

  const call = React.useCallback((text: string) => {
    setLast((prev) => ({ text, id: (prev?.id ?? 0) + 1 }))
  }, [])

  const restart = React.useCallback((next?: number) => {
    setLeaving(false)
    setLength(0)
    setLast(undefined)
    if (next !== undefined) setIndex(next)
    setRound((value) => value + 1)
  }, [])

  React.useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") restart()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [restart])

  React.useEffect(() => {
    let live = true
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        if (live) timers.add(setTimeout(resolve, ms))
      })
    }

    function fire(target: Element, type: string) {
      const box = boxRef.current?.getBoundingClientRect()
      if (!box) return
      const down = type.endsWith("down")
      const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent
      const init: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        button: 0,
        buttons: down ? 1 : 0,
        clientX: box.left + posRef.current.x,
        clientY: box.top + posRef.current.y,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        width: 1,
        height: 1,
        pressure: down ? 0.5 : 0,
      }
      target.dispatchEvent(new Ctor(type, init))
    }

    async function down(target: Element, ms: number) {
      setCursor((prev) => ({ ...prev, down: true }))
      fire(target, "pointerdown")
      fire(target, "mousedown")
      await wait(ms)
      fire(target, "pointerup")
      fire(target, "mouseup")
      setCursor((prev) => ({ ...prev, down: false }))
    }

    const c: Cursor = {
      async moveTo(target, at = {}) {
        const box = boxRef.current?.getBoundingClientRect()
        const rect = target?.getBoundingClientRect()
        if (!box || !rect) return
        const next = {
          x: rect.left - box.left + rect.width * (at.x ?? 0.55),
          y: rect.top - box.top + rect.height * (at.y ?? 0.6),
        }
        const distance = Math.hypot(
          next.x - posRef.current.x,
          next.y - posRef.current.y
        )
        const ms = reduce ? 0 : Math.min(900, 320 + distance * 1.3)
        posRef.current = next
        setCursor((prev) => ({ ...prev, ...next, ms }))
        await wait(ms + 240)
      },
      async press(target, ms = 1450) {
        if (target) await down(target, ms)
      },
      async click(target) {
        if (!target) return
        setPulse({ ...posRef.current, id: Date.now() })
        await down(target, 110)
        if (target instanceof HTMLElement) target.click()
        await wait(80)
      },
      async type(target, text) {
        if (!(target instanceof HTMLInputElement)) return
        const set = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )?.set
        for (const char of text) {
          set?.call(target, target.value + char)
          target.dispatchEvent(new Event("input", { bubbles: true }))
          await wait(55)
        }
      },
      wait,
      async until(get) {
        for (let tries = 0; tries < 50; tries++) {
          const found = get()
          if (found) return found
          await wait(100)
        }
        return null
      },
      find(selector, text) {
        const all = sceneRef.current?.querySelectorAll<HTMLElement>(selector)
        return (
          [...(all ?? [])].find(
            (el) => !text || el.textContent?.includes(text)
          ) ?? null
        )
      },
    }

    async function play() {
      setLength(await estimate(scene))
      if (!shownRef.current) {
        const box = boxRef.current?.getBoundingClientRect()
        posRef.current = {
          x: (box?.width ?? 0) - 28,
          y: (box?.height ?? 0) - 8,
        }
        setCursor((prev) => ({ ...prev, ...posRef.current, ms: 0 }))
        await wait(50)
        shownRef.current = true
        setCursor((prev) => ({ ...prev, shown: true }))
        await wait(400)
      }
      await wait(500)
      await scene.run(c)
      setLeaving(true)
      await wait(250)
      setLeaving(false)
      setLength(0)
      setLast(undefined)
      setIndex((scenes.indexOf(scene) + 1) % scenes.length)
    }

    play()

    return () => {
      live = false
      timers.forEach(clearTimeout)
    }
  }, [scene, round])

  return (
    <div className="border border-(--rule) bg-(--well)">
      <div className="flex flex-wrap border-b border-(--rule) px-2 font-mono text-[11px]">
        {scenes.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => restart(i)}
            className={cn(
              "relative px-3 py-2.5 whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--mark)",
              i === index
                ? "text-(--ink)"
                : "text-(--ink-label) hover:text-(--ink-muted)"
            )}
          >
            {item.label}
            {i === index && length > 0 && (
              <span
                key={`${scene.id}-${round}`}
                className="absolute inset-x-0 -bottom-px h-0.5 origin-left animate-fill-x bg-(--mark) motion-reduce:animate-none"
                style={{ animationDuration: `${length}ms` }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="grid gap-4 p-5">
        <div ref={boxRef} inert className="relative">
          <div
            key={`${scene.id}-${round}`}
            ref={sceneRef}
            className={cn(
              "grid h-44 animate-in place-items-center text-foreground transition-opacity duration-300 fade-in motion-reduce:animate-none",
              leaving && "opacity-0"
            )}
          >
            {scene.render(call)}
          </div>
          {pulse && (
            <span
              key={pulse.id}
              className="absolute top-0 left-0 z-10 -mt-4 -ml-4 size-8 animate-pulse-out rounded-full border-2 border-(--mark) motion-reduce:hidden"
              style={{ translate: `${pulse.x}px ${pulse.y}px` }}
            />
          )}
          <div
            className="absolute top-0 left-0 z-20 ease-[cubic-bezier(0.5,0.05,0.2,1)]"
            style={{
              translate: `${cursor.x}px 0`,
              opacity: cursor.shown ? 1 : 0,
              transitionProperty: "translate, opacity",
              transitionDuration: `${cursor.ms}ms, 400ms`,
            }}
          >
            <div
              className="transition-[translate] ease-[cubic-bezier(0.3,0.1,0.15,1)]"
              style={{
                translate: `0 ${cursor.y}px`,
                transitionDuration: `${cursor.ms}ms`,
              }}
            >
              <div
                className="origin-top-left transition-[scale] duration-150 ease-out"
                style={{ scale: cursor.down ? "0.86" : "1" }}
              >
                <Arrow />
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-5 items-center justify-between gap-4 border-t border-(--rule) pt-4 font-mono text-xs">
          <span
            key={last?.id ?? "none"}
            className={cn(
              "animate-in truncate duration-300 fade-in motion-reduce:animate-none",
              last ? "text-(--ink-muted)" : "text-(--ink-label)",
              leaving && "opacity-0 transition-opacity duration-250"
            )}
          >
            {last ? (
              <>
                <span className="text-(--mark)">›</span> {last.text}
              </>
            ) : (
              "// nothing has run yet"
            )}
          </span>
          <span className="shrink-0 text-(--ink-label) max-sm:hidden">
            {scene.hint}
          </span>
        </div>
      </div>
    </div>
  )
}
