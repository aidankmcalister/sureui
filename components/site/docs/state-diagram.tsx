import { cn } from "@/lib/utils"
import { Label } from "@/components/site/layout/frame"

const states = [
  { name: "idle", x: 108, y: 16 },
  { name: "armed", x: 32, y: 104 },
  { name: "holding", x: 184, y: 104 },
  { name: "ready", x: 184, y: 184 },
  { name: "undo", x: 32, y: 320 },
  { name: "pending", x: 184, y: 456 },
]

const steps = [
  { name: "confirm", x: 112, y: 252 },
  { name: "onConfirm()", x: 112, y: 392 },
]

const forward = [
  { d: "M124 48V72H84V104", label: "click-again", x: 90, y: 92 },
  { d: "M196 48V72H236V104", label: "hold", x: 242, y: 92 },
  { d: "M160 48V252", label: "click", x: 166, y: 168 },
  { d: "M236 136V184", label: "filled", x: 242, y: 164 },
  { d: "M84 136V264H112", label: "2nd click", x: 90, y: 200 },
  { d: "M236 216V264H208", label: "release", x: 242, y: 244 },
  { d: "M136 276V296H84V320", label: "undo", x: 90, y: 312 },
  { d: "M160 276V392", label: "no undo", x: 166, y: 340 },
  { d: "M84 352V404H112", label: "window ends", x: 90, y: 380 },
  { d: "M208 404H236V456", label: "promise", x: 242, y: 436 },
]

const back = [
  { d: "M12 436V32H108", label: "no promise", x: 20, y: 430 },
  { d: "M32 120H12" },
  { d: "M32 336H12" },
  { d: "M160 416V436H12" },
  { d: "M308 472V32H212" },
  { d: "M288 120H308" },
  { d: "M288 200H308" },
  { d: "M288 472H308" },
]

const joins = [
  [12, 120],
  [12, 336],
  [12, 436],
  [308, 120],
  [308, 200],
  [308, 472],
]

const edgeLabel =
  "fill-(--ink-label) stroke-(--well) stroke-[4px] [paint-order:stroke]"

export function StateDiagram({
  description,
  className,
}: {
  description: string
  className?: string
}) {
  return (
    <figure className={cn("border border-(--rule) bg-(--well)", className)}>
      <figcaption className="flex h-10 items-center border-b border-(--rule) px-4">
        <Label>Fig. States</Label>
      </figcaption>
      <svg
        role="img"
        aria-labelledby="state-diagram-title"
        viewBox="0 0 320 520"
        className="mx-auto block w-full max-w-90 px-1 py-4 font-mono"
      >
        <title id="state-diagram-title">{description}</title>
        <defs>
          <marker
            id="state-diagram-arrow"
            viewBox="0 0 6 6"
            refX="6"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0L6 3L0 6z" className="fill-(--ink-label)" />
          </marker>
        </defs>
        <g
          fill="none"
          strokeWidth={1}
          markerEnd="url(#state-diagram-arrow)"
          className="stroke-(--ink-label)"
        >
          {forward.map((edge) => (
            <path key={edge.d} d={edge.d} />
          ))}
        </g>
        <g fill="none" strokeWidth={1} strokeDasharray="3 3">
          {back.map((edge, index) => (
            <path
              key={edge.d}
              d={edge.d}
              className="stroke-(--ink-label)"
              markerEnd={
                index === 0 || index === 4
                  ? "url(#state-diagram-arrow)"
                  : undefined
              }
            />
          ))}
        </g>
        {joins.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={2}
            className="fill-(--ink-label)"
          />
        ))}
        <g fontSize={10}>
          {[...forward, ...back].map((edge) =>
            "label" in edge && edge.label ? (
              <text
                key={edge.label}
                x={edge.x}
                y={edge.y}
                className={edgeLabel}
              >
                {edge.label}
              </text>
            ) : null
          )}
        </g>
        {states.map((state) => (
          <g key={state.name}>
            <rect
              x={state.x + 0.5}
              y={state.y + 0.5}
              width={103}
              height={31}
              className={cn(
                "fill-(--paper)",
                state.name === "idle" ? "stroke-(--mark)" : "stroke-(--rule)"
              )}
            />
            <text
              x={state.x + 52}
              y={state.y + 20}
              textAnchor="middle"
              fontSize={11}
              className="fill-(--ink) tracking-widest uppercase"
            >
              {state.name}
            </text>
          </g>
        ))}
        {steps.map((step) => (
          <g key={step.name}>
            <rect
              x={step.x + 0.5}
              y={step.y + 0.5}
              width={95}
              height={23}
              strokeDasharray="3 2"
              className="fill-(--well) stroke-(--mark)"
            />
            <text
              x={step.x + 48}
              y={step.y + 16}
              textAnchor="middle"
              fontSize={11}
              className="fill-(--mark-text)"
            >
              {step.name}
            </text>
          </g>
        ))}
        <g fontSize={10} className="fill-(--ink-label)">
          <path
            d="M12 504H36"
            strokeWidth={1}
            className="stroke-(--ink-label)"
          />
          <text x={42} y={507}>
            forward
          </text>
          <path
            d="M140 504H164"
            strokeWidth={1}
            strokeDasharray="3 3"
            className="stroke-(--ink-label)"
          />
          <text x={170} y={507}>
            back to idle
          </text>
        </g>
      </svg>
    </figure>
  )
}
