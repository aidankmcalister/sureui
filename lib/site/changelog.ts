export type Release = {
  version: string
  date: string
  summary: string
  sections: { label: string; items: string[] }[]
}

export const releases: Release[] = [
  {
    version: "0.1.1",
    date: "2026-09-28",
    summary:
      "A redesigned Consequences, a pulse while controls are pending, and new docs. ConfirmSwitch is removed for now.",
    sections: [
      {
        label: "Changes",
        items: [
          "`Consequences` is now a ledger: one row per item with the count on the right and names underneath. Labels read as row headings, so pass them capitalized, like `Deployments`.",
          '`Consequences` counts the names when you don\'t pass `count`, and `variant="destructive"` tints the whole list.',
          "Controls pulse while an async `onConfirm` is pending, instead of dimming. With `prefers-reduced-motion` they dim as before.",
        ],
      },
      {
        label: "Removed",
        items: [
          "`ConfirmSwitch` is out of the registry while it's reworked. Installed copies keep working.",
        ],
      },
      {
        label: "Docs",
        items: [
          "One page per component, each with live examples, a props table and a table of contents.",
          "Old style pages like `/docs/undo` and `/docs/hold` redirect to their component page.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-28",
    summary:
      "The first release: nine registry items for shadcn/ui on Base UI, all built on one confirmation core.",
    sections: [
      {
        label: "Components",
        items: [
          "`ConfirmButton` confirms on a click, a second click or a press and hold, with optional inline undo.",
          "`ConfirmMenuItem` brings the same gestures to dropdown and context menu items. The menu stays open until the action commits.",
          "`TypeToConfirm` unlocks only after the exact phrase is typed and every acknowledgement is checked. `caseSensitive` and `trim` control how the phrase matches.",
          "`ConfirmDialog` puts a `ConfirmButton` or `TypeToConfirm` in an alert dialog. `useConfirm` returns an awaitable `confirm()`.",
          "`ConfirmPopover` anchors a one-line confirm to any trigger.",
          "`ConfirmSwitch` asks before the risky direction of a switch and toggles the other way at once.",
          "`Consequences` lists what a confirmation will remove, with counts and names.",
          "`undoToast(message)` shows a Sonner toast with Undo and resolves `true` only if nobody undoes.",
          "`Undoable` collapses a removed row in place to a label and an Undo button.",
        ],
      },
      {
        label: "Behavior",
        items: [
          "`onConfirm` can return a promise. The control stays pending and keeps focus until it settles, and goes back to idle if it throws.",
          "Undo windows pause on hover, on keyboard focus and while the tab is hidden. Each pause can be turned off per control.",
          "A hold confirms when you let go (`confirmOnRelease`), and `holdFallback` lets screen reader and keyboard users confirm it with a second click.",
          "A quick double click confirms `click-again`, and an armed button disarms when focus leaves (`cancelOnBlur`).",
          "Undo is announced to screen readers, and key repeat can't confirm or undo anything.",
          "Every label and announcement is a prop.",
          "Undo windows are kept between 4 and 60 seconds, and other durations are capped at 60 seconds.",
        ],
      },
    ],
  },
]
