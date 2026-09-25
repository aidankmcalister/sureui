# SureUI domain

SureUI is a shadcn/ui registry of confirmation controls. These terms are the shared vocabulary for code, docs and plans.

**Confirmation**: one attempt to get intent for an action. It starts idle and ends by committing (`onConfirm`) or cancelling (`onCancel`). Every confirmation settles.

**Gesture**: how a person proves intent. `click` (one click), `click-again` (arm, then click again within a timeout), `hold` (press and hold for a duration), `type` (type a phrase, handled by TypeToConfirm).

**Friction**: how much effort a gesture costs. Match friction to risk: reversible actions get none, permanent ones get the most.

**Surface**: where a confirmation appears. Inline is the default. A dialog is an optional surface that wraps an inline control, never the default.

**Undo window**: an optional delay after confirming, before `onConfirm` runs. The control shows "Undo" while it drains. Undoing cancels. Unmounting during the window cancels too.

**Pending**: the state while an async `onConfirm` is running. The control is disabled until it settles.

**Confirmation core**: the module every control is built on (`components/ui/sureui/confirmation.ts`). It owns the state machine, timing, announcements and handler composition. Controls are thin adapters over it.

**Undo toast**: `undoToast()`, an optional Sonner-based undo for actions whose control disappears. It is separate from the core on purpose: its lifecycle belongs to Sonner.
