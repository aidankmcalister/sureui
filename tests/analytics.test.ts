import { afterEach, describe, expect, it, vi } from "vitest"

import { linkEvent, track, trackCall } from "@/lib/site/analytics"

type WithUmami = { umami?: { track: (...args: unknown[]) => void } }

afterEach(() => {
  delete (window as WithUmami).umami
})

describe("analytics", () => {
  it("does nothing when Umami isn't loaded", () => {
    expect(() => track("theme", { to: "dark" })).not.toThrow()
  })

  it("does nothing when Umami throws", () => {
    ;(window as WithUmami).umami = {
      track: () => {
        throw new Error("blocked")
      },
    }
    expect(() => track("theme", { to: "dark" })).not.toThrow()
  })

  it("sends the event and its data", () => {
    const send = vi.fn()
    ;(window as WithUmami).umami = { track: send }
    track("copy-install", {
      args: "add @sureui/confirm-button",
      runner: "pnpm",
    })
    trackCall({ event: "copy-code", data: { label: "confirm-button/demo" } })
    trackCall(undefined)
    expect(send.mock.calls).toEqual([
      ["copy-install", { args: "add @sureui/confirm-button", runner: "pnpm" }],
      ["copy-code", { label: "confirm-button/demo" }],
    ])
  })

  it("tags links for Umami's click tracking", () => {
    expect(linkEvent("https://github.com")).toEqual({
      "data-umami-event": "link",
      "data-umami-event-href": "https://github.com",
    })
  })
})
