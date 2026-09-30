# Undo

SureUI's undo delays the action. `onConfirm` runs when the undo window closes, so pressing Undo never has to reverse anything on the server.

| After the click, the control | Use |
|---|---|
| Stays on screen | `ConfirmButton undo` or `ConfirmMenuItem undo` |
| Goes away (the page changes, the item leaves) | `undoToast(message)` |
| Is a row leaving a list or table | `Undoable` |

## Commit after the window, not before

**Avoid**

```tsx
async function archive() {
  await api.archive(id)
  toast("Archived", { action: { label: "Undo", onClick: () => api.unarchive(id) } })
}
```

**Use**

```tsx
if (await undoToast("Archived 1 message")) {
  await api.archive(id)
}
```

`undoToast` resolves `true` when the toast closes and `false` when someone presses Undo. It needs the shadcn `<Toaster />` in the root layout.

## Rows

```tsx
<Undoable
  render={<li className="flex items-center justify-between" />}
  label={`Deleted ${file}`}
  onConfirm={() => deleteFile(file)}
>
  {({ remove }) => (
    <>
      {file}
      <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>
    </>
  )}
</Undoable>
```

## How the window behaves

- `undo` takes `true` (5 seconds), a number of milliseconds (kept between 4 and 60 seconds), or `"manual"`, which has no timer and commits when a press or focus lands outside the control.
- Pointing at or focusing the control pauses the window, and so does a hidden tab.
- Unmounting during the window, including closing the tab, drops the action without calling either handler. `ConfirmMenuItem` is the exception: closing its menu commits.

Reference: https://sureui.com/docs/undo-toast, https://sureui.com/docs/undoable
