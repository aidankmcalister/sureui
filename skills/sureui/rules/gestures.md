# Gestures

`ConfirmButton`, `ConfirmMenuItem`, `ConfirmPopover` and `ConfirmDialog`'s confirm button share these `gesture` values:

| `gesture` | How it confirms | Fits |
|---|---|---|
| `"click"` (default) | One click. Add `undo` | Reversible actions |
| `"click-again"` | A click arms it, a second click within `timeout` (3000ms) confirms | Common, recoverable actions |
| `"hold"` | A press held for `duration` (1200ms). Letting go early cancels | Dangerous one-offs |
| `"slide"` | A drag to the end, or two clicks | Touch-first screens |

`wait` adds a countdown before the control unlocks, and `armDelay` ignores clicks for a moment after arming.

## Pass the action to `onConfirm`

`onClick` runs on every click, including the one that only arms.

**Avoid**

```tsx
<ConfirmButton gesture="click-again" onClick={deleteBranch}>
  Delete branch
</ConfirmButton>
```

**Use**

```tsx
<ConfirmButton gesture="click-again" onConfirm={deleteBranch}>
  Delete branch
</ConfirmButton>
```

## One confirmation per action

**Avoid**

```tsx
<ConfirmDialog title="Are you sure?" onConfirm={revoke}>
  <ConfirmButton gesture="hold" onConfirm={revoke}>Revoke</ConfirmButton>
</ConfirmDialog>
```

**Use**

```tsx
<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
  Revoke key
</ConfirmButton>
```

## Errors

When `onConfirm` throws or rejects, the control goes back to idle and the error reaches the app unchanged. To show it on the control instead, pass `onConfirmError`: the control shows `errorLabel` and sets `data-error` until the next attempt.

```tsx
<ConfirmButton
  gesture="click-again"
  onConfirm={deleteBranch}
  onConfirmError={reportError}
  errorLabel="Couldn't delete"
>
  Delete branch
</ConfirmButton>
```

## Labels and state

- Name the verb and the thing: "Delete 3 files", never "OK" or "Yes". `variant="destructive"` adds to the words; it doesn't replace them.
- `confirmLabel`, `undoLabel` and `errorLabel` change the text for each state, and `announcements` changes what screen readers hear.
- Controls set `data-state` to `idle`, `armed`, `holding`, `undo` or `pending`. Style with those attributes rather than tracking state yourself.

Reference: https://sureui.com/docs/confirm-button, https://sureui.com/docs/confirm-menu-item
