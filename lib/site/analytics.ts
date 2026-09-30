type Events = {
  "copy-install": { args: string; runner: string }
  "copy-code": { label: string }
  "code-tab": { example: string }
  "example-action": { example: string; action: string }
  "example-control": { example: string; control: string; value: string }
  "example-reset": { example: string }
  "search-select": { query: string; href: string }
  "search-miss": { query: string }
  theme: { to: string }
  "not-found": { path: string }
  choose: { undo: string; count: string; place: string; item: string }
}

type Umami = { track: (event: string, data?: object) => void }

export type TrackEvent = keyof Events

export type TrackCall = {
  [E in TrackEvent]: { event: E; data: Events[E] }
}[TrackEvent]

export function track<E extends TrackEvent>(event: E, data: Events[E]) {
  try {
    ;(window as { umami?: Umami }).umami?.track(event, data)
  } catch {}
}

export function trackCall(call: TrackCall | undefined) {
  if (call) track(call.event, call.data as never)
}

export function linkEvent(href: string) {
  return { "data-umami-event": "link", "data-umami-event-href": href }
}
