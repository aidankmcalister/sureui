export type Excerpt = {
  file: string
  source: string
}

export type GuideSection = {
  id: string
  label: string
  paragraphs: string[]
  items?: string[]
  excerpt?: Excerpt
}

export type StateNote = {
  name: string
  note: string
}

const core = "components/ui/sureui"

export const howItsBuilt = {
  core: {
    id: "core",
    label: "The core",
    paragraphs: [
      "Every control is a thin adapter over one module, `confirmation.ts`. It owns the state machine, the gesture rules, timing and handler composition. `ConfirmButton`, `ConfirmMenuItem` and `ConfirmSwitch` call its `useConfirmation` hook. `TypeToConfirm`, `ConfirmDialog` and `ConfirmPopover` render a `ConfirmButton`. `undoToast` and `Undoable` reuse the undo window and the fill directly, because the thing that starts their undo isn't the thing that shows it.",
      "The controls add labels, announcements and styling. Everything on this page lives in three files: `confirmation.ts`, `undo-window.ts` and `fill.ts`.",
    ],
  } satisfies GuideSection,
  states: {
    id: "states",
    label: "States",
    paragraphs: [
      "A confirmation is always in one of six states, set as `data-state` on the trigger. Confirming is a step, not a state: with `undo` it opens the undo window, otherwise it runs `onConfirm`. If `onConfirm` throws or rejects, the control returns to idle and the error reaches your app.",
    ],
    figure:
      "State diagram. From idle, click-again goes to armed, hold goes to holding, and click goes straight to confirm. Armed confirms on a second click. Holding becomes ready when the fill completes, and ready confirms on release. Confirm opens undo when undo is on, otherwise it runs onConfirm. Undo runs onConfirm when the window ends. onConfirm goes to pending if it returns a promise. Every state can return to idle.",
    notes: [
      {
        name: "idle",
        note: "Nothing in progress. With `click` a click confirms, with `click-again` it arms, and with `hold` a primary press, Space or Enter starts holding.",
      },
      {
        name: "armed",
        note: "Waiting for a second click, which confirms. After `timeout` (3000ms) or on blur it returns to idle and calls `onCancel`.",
      },
      {
        name: "holding",
        note: "The fill runs for `duration` (1200ms, at least 800ms). Letting go early, leaving, blurring or a pointer cancel returns to idle and calls `onCancel`.",
      },
      {
        name: "ready",
        note: "Filled and waiting for release. Releasing inside confirms. Releasing outside, leaving or blurring cancels. With `confirmOnRelease={false}` a hold skips this state and confirms when filled.",
      },
      {
        name: "undo",
        note: "Confirmed, but `onConfirm` hasn't run. Undo returns to idle and calls `onCancel`. When the window ends, `onConfirm` runs. Unmounting calls neither, except in `ConfirmMenuItem`, which commits when its menu closes.",
      },
      {
        name: "pending",
        note: "`onConfirm` returned a promise. The trigger is disabled until it settles, then returns to idle.",
      },
    ] satisfies StateNote[],
  },
  sections: [
    {
      id: "timing",
      label: "Timers decide, animations draw",
      paragraphs: [
        "Every deadline is a `setTimeout`: the click-again timeout, the hold duration and the undo window. State changes when a timer fires, never when an animation ends.",
        "Each timed state carries a fill: where it starts and ends, how long it runs and when it started. `useFill` plays it as a Web Animation on the CSS `scale` property and sets `currentTime` from the start time, so a re-render lands on the same frame. When the undo window pauses, the animation pauses with it. A cancelled hold drains from where it got to over 200ms.",
        "With reduced motion the fill uses `step-end` easing: it holds still and jumps at the end, and the timing doesn't change. Where Web Animations are missing, as in jsdom, `playFill` returns `null` and the control behaves the same.",
      ],
      excerpt: {
        file: `${core}/fill.ts`,
        source: `const animation = element.animate(
  [{ scale: \`\${fill.from} 1\` }, { scale: \`\${fill.to} 1\` }],
  {
    duration: fill.duration,
    easing: prefersReducedMotion() ? "step-end" : (fill.easing ?? "linear"),
    fill: "forwards",
  }
)
animation.currentTime = performance.now() - fill.startedAt`,
      },
    },
    {
      id: "undo-window",
      label: "The undo window",
      paragraphs: [
        "`startUndoWindow` keeps the remaining time and a set of pause reasons: `hover`, `focus` and `hidden`. It pauses on the first reason and resumes when the last one clears, so a hidden tab and a hover don't undo each other. A window that opens while the tab is hidden waits until it's visible.",
        "Inline controls add one rule: hover and focus only pause after they have ended once. The pointer that clicked is still over the button and the button still has focus, so the window runs. Leave and come back, by pointer or focus, and it pauses until you leave again. `pauseUndoOnHover` and `pauseUndoOnFocus` turn either off. `undoToast` pauses on the first hover or focus, since the toast appears away from what was clicked.",
        "`undo` takes `true` for 5000ms or a number of milliseconds, kept between 4000ms and 60000ms. Holds have an 800ms floor, every duration is capped at a minute, and values that aren't finite fall back to the defaults.",
      ],
      excerpt: {
        file: `${core}/undo-window.ts`,
        source: `function pause(reason: UndoPauseReason) {
  if (!open || pausedBy.has(reason)) return
  pausedBy.add(reason)
  if (pausedBy.size > 1) return
  clearTimeout(timer)
  remaining -= performance.now() - startedAt
  onPauseChange?.(true)
}`,
      },
    },
    {
      id: "handlers",
      label: "Handler composition",
      paragraphs: [
        "`useConfirmation` returns `state`, a `fillRef` and `getTriggerProps`. A control passes its remaining props through `getTriggerProps` and spreads the result on its trigger. Every pointer, key, focus and click handler the gesture needs is composed: yours runs first, then ours, and ours always runs, so an `onClick` or `onKeyDown` you pass can't break the gesture.",
        "`getTriggerProps` also sets `disabled`. Pending disables the trigger, and a disabled control keeps Undo pressable during the window.",
        "The gesture rules exist once. `ConfirmButton` spreads the props on a `Button`, `ConfirmMenuItem` on a menu item and `ConfirmSwitch` on a switch, so all three get the same click-again and hold behavior.",
      ],
      excerpt: {
        file: `${core}/confirmation.ts`,
        source: `function composeHandlers<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void
) {
  return (event: E) => {
    theirs?.(event)
    ours(event)
  }
}`,
      },
    },
    {
      id: "hold",
      label: "Hold",
      paragraphs: [
        "A hold confirms on release. When the fill completes the control is ready: releasing inside the trigger confirms, and releasing outside, leaving or blurring cancels, so a finished hold can still be abandoned. Space and Enter hold like a pointer and ignore key repeat. Only the primary button starts a hold, and the context menu is suppressed.",
        'Screen readers and switch access often send a click with no press, or a virtual press with no size. They can\'t hold, so with `holdFallback="click-again"`, the default, that click arms and the next one confirms. A key let go early arms the same way. A mouse let go early still cancels. `holdFallback="none"` turns the fallback off, and the hint read with the trigger says which applies.',
      ],
      excerpt: {
        file: `${core}/confirmation.ts`,
        source: `function isVirtualPress(event: React.PointerEvent) {
  const { width, height, pressure, pointerType } = event.nativeEvent
  if (width < 1 && height < 1) return true
  return (
    pointerType === "mouse" &&
    width === 1 &&
    height === 1 &&
    pressure === 0 &&
    /Android/i.test(navigator.userAgent)
  )
}`,
      },
    },
    {
      id: "width",
      label: "Stable width",
      paragraphs: [
        "Every label a control can show, the idle text, the armed prompt, the release label and Undo, sits in the same grid cell. Only the current one is visible. The others are `invisible` and `aria-hidden`, so the trigger is always as wide as its widest label and doesn't jump when the text changes.",
        'Changes are announced through a separate polite live region, such as "Click again to confirm" or "Done. Undo is available."',
      ],
      excerpt: {
        file: `${core}/confirm-button.tsx`,
        source: `<span className="grid gap-[inherit]">
  {labels.map((label) => (
    <span
      key={label.state}
      aria-hidden={label.state !== shown || undefined}
      className={cn(
        "col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]",
        label.state !== shown && "invisible"
      )}
    >
      {label.node}
    </span>
  ))}
</span>`,
      },
    },
    {
      id: "tests",
      label: "What the tests pin down",
      paragraphs: [
        "More than 200 Vitest tests run with `pnpm check` and in CI.",
      ],
      items: [
        "Behavior, most of the suite: every control and block is rendered with Testing Library and driven through its public interface, with fake `setTimeout`, `clearTimeout` and `performance`. No test patches `Element.prototype.animate` or `window.matchMedia`.",
        'Registry: every file starts with `"use client"`, lives in `components/ui/sureui` and targets `@ui/sureui`, and every item declares the SureUI files, stock components and packages it imports.',
        "Docs: each props table lists exactly the props its component declares. The lists are checked against the types with `satisfies`, so a new prop fails typecheck until it's documented.",
        "Generated files: the agent rules and skill are generated from the docs data, and a test fails if the committed copies are out of date. `llms.txt` has to link every page and item and include every prop.",
        "Smoke install, in CI: the registry is built and served locally, a fresh app is created with `shadcn init`, every item and block is installed into it, and the app is type-checked.",
      ],
    },
  ] satisfies GuideSection[],
}
