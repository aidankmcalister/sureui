# Choosing by risk

Match the confirmation to what's lost if the click was a mistake. Too little and people lose work. Too much and they learn to confirm without reading.

## Undo instead of asking

For reversible actions, act at once and offer Undo.

**Avoid**

```tsx
<ConfirmDialog title="Archive this message?" onConfirm={archive}>
  <Button>Archive</Button>
</ConfirmDialog>
```

**Use**

```tsx
<ConfirmButton undo onConfirm={archive}>
  Archive
</ConfirmButton>
```

## Ask for the name when it's permanent

A second click isn't enough when nothing can bring it back.

**Avoid**

```tsx
<ConfirmButton gesture="click-again" onConfirm={deleteProject}>
  Delete project
</ConfirmButton>
```

**Use**

```tsx
<ConfirmDialog
  title="Delete acme-prod?"
  description="This removes the project, its deployments and its data. It can't be undone."
  phrase="acme-prod"
  confirmLabel="Delete project"
  variant="destructive"
  onConfirm={deleteProject}
>
  <Button variant="destructive">Delete project</Button>
</ConfirmDialog>
```

## Many things at once

SureUI has no bulk component. Choose from the count: undo for a few, a second click for dozens, and the count typed for hundreds.

```tsx
const label = `Delete ${count} issues`

count > 100 ? (
  <TypeToConfirm phrase={String(count)} confirmLabel={label} variant="destructive" onConfirm={remove} />
) : (
  <ConfirmButton
    gesture={count > 10 ? "click-again" : "click"}
    undo={count <= 10}
    variant="destructive"
    onConfirm={remove}
  >
    {label}
  </ConfirmButton>
)
```

## Unsaved edits

`useUnsavedChanges` asks before edits are lost to navigation, closing or reloading.

```tsx
const { confirmLeave, dialog } = useUnsavedChanges({ when: dirty, onSave: save })

async function goBack() {
  if (await confirmLeave()) router.back()
}
```

Render `dialog` once in the component.

## Changing a value

A select or radio whose new value needs a yes: await `confirm()` from `useConfirm` before setting it. See [dialogs.md](./dialogs.md).

Reference: https://sureui.com/docs/choosing-a-confirmation
