import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }

const colors = {
  paper: "#121213",
  ink: "#f4f4f5",
  muted: "#a1a1aa",
  rule: "#2a2a2e",
  mark: "#f97316",
}

const inset = 64
const top = 112
const bottom = 518

const display = await readFile(
  join(process.cwd(), "app/fonts/space-grotesk-latin-700-normal.woff")
)
const sans = await readFile(
  join(process.cwd(), "app/fonts/geist-sans-latin-400-normal.woff")
)

function Rule({ x, y }: { x?: number; y?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        background: colors.rule,
        ...(x === undefined
          ? { left: 0, right: 0, top: y, height: 1 }
          : { top: 0, bottom: 0, left: x, width: 1 }),
      }}
    />
  )
}

function Plus({ x, y }: { x: number; y: number }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      style={{ position: "absolute", left: x - 7, top: y - 7 }}
    >
      <path d="M7.5 0v15M0 7.5h15" stroke={colors.mark} strokeWidth="1.5" />
    </svg>
  )
}

export function card({
  lead,
  rest,
  detail,
}: {
  lead: string
  rest?: string
  detail: string
}) {
  const xs = [inset, ogSize.width - inset - 1]
  const ys = [top, bottom]

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: colors.paper,
        fontFamily: "Geist",
      }}
    >
      {xs.map((x) => (
        <Rule key={`x${x}`} x={x} />
      ))}
      {ys.map((y) => (
        <Rule key={`y${y}`} y={y} />
      ))}
      {xs.flatMap((x) => ys.map((y) => <Plus key={`${x}-${y}`} x={x} y={y} />))}
      <div
        style={{
          position: "absolute",
          left: inset + 48,
          top: 0,
          height: top,
          display: "flex",
          alignItems: "center",
          fontFamily: "Space Grotesk",
          fontSize: 34,
          letterSpacing: -0.85,
          color: colors.ink,
        }}
      >
        SureUI
        <span style={{ color: colors.mark }}>.</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: inset + 48,
          right: inset + 48,
          top,
          height: bottom - top,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Space Grotesk",
            fontSize: 80,
            lineHeight: 1.05,
            letterSpacing: -3.2,
            color: colors.ink,
          }}
        >
          <span style={{ color: colors.mark }}>{lead}</span>
          {rest && <span>{rest}</span>}
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.4, color: colors.muted }}>
          {detail}
        </div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Space Grotesk", data: display, weight: 700, style: "normal" },
        { name: "Geist", data: sans, weight: 400, style: "normal" },
      ],
    }
  )
}
