# Dialogs

A dialog is for when a confirmation needs room: to list what goes, to ask for a typed name, or to offer a softer option. Anything smaller confirms inline.

## `ConfirmDialog` takes its trigger as a child

It manages its own open state.

**Avoid**

```tsx
const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Delete</Button>
<AlertDialog open={open} onOpenChange={setOpen}>…</AlertDialog>
```

**Use**

```tsx
<ConfirmDialog
  title="Delete the staging environment?"
  description="Production isn't affected."
  consequences={
    <Consequences
      title="This deletes"
      variant="destructive"
      items={[
        { label: "Deployments", count: 42 },
        { label: "Domains", names: ["staging.acme.com", "preview.acme.com"] },
      ]}
    />
  }
  confirmLabel="Delete environment"
  variant="destructive"
  onConfirm={deleteEnvironment}
>
  <Button>Delete staging</Button>
</ConfirmDialog>
```

## `useConfirm` asks from code

Use it when the question comes from a handler, or when confirming removes the trigger from the page. `confirm()` resolves `true` when confirmed and `false` otherwise.

```tsx
const { confirm, dialog } = useConfirm()

async function changeRole(next: string) {
  if (await confirm({ title: `Make Ava a ${next}?`, confirmLabel: `Make ${next}` })) {
    setRole(next)
  }
}

return (
  <>
    <Select value={role} onValueChange={changeRole}>…</Select>
    {dialog}
  </>
)
```

## `Consequences` shows changes as well as losses

Items take `count`, `names`, or `from` and `to`:

```tsx
<Consequences
  title="On October 29"
  items={[
    { label: "Plan", from: "Pro", to: "Free" },
    { label: "Seats", from: 5, to: 1 },
  ]}
/>
```

## More options

- `phrase` takes one string or several to type. `acknowledgements` adds checkboxes that must be ticked, and `choices` adds options that reach `onConfirm`.
- `alternative={{ label: "Archive instead", onSelect: archive }}` offers a softer action.
- `gesture`, `wait` and `initialFocus` (`"cancel"`, `"confirm"` or `"none"`) are also available.
- For a short question without a modal, `ConfirmPopover` anchors to its trigger.

Reference: https://sureui.com/docs/confirm-dialog, https://sureui.com/docs/consequences
