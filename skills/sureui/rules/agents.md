# AI tool approval

`ToolApproval` answers an AI SDK tool call that is waiting for approval. Its callback is `onRespond`, so it takes `addToolApprovalResponse` from `useChat` as is.

## Mark the tool on the server

```tsx
const agent = new ToolLoopAgent({
  model,
  tools: { deleteProject },
  toolApproval: { deleteProject: "user-approval" },
})
```

## Render it for the tool part

**Avoid**

```tsx
<Button onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}>
  Approve
</Button>
```

**Use**

```tsx
const { messages, addToolApprovalResponse } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
})

part.type === "tool-deleteProject" && (
  <ToolApproval part={part} risk="high" onRespond={addToolApprovalResponse} />
)
```

## `risk` sets how approval works

| `risk` | Approve by | Fits tools that |
|---|---|---|
| `"low"` | A click, with an undo window | Send a message, create a draft |
| `"medium"` (default) | A second click | Edit records, invite someone |
| `"high"` | A press and hold | Deploy, revoke access |
| `"critical"` | Typing `phrase` | Delete a project or a database |

`"critical"` requires `phrase`, usually the name of the thing. Deny is always one click.

## More options

- `note` adds a field; its text reaches the agent as `reason`.
- `scopes` offers `"once"`, `"session"` or `"always"`.
- `ToolApprovalBatch` answers several pending calls together, at the highest risk among them.

Reference: https://sureui.com/docs/tool-approval
