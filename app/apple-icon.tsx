import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"
export const dynamic = "force-static"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#121213",
      }}
    >
      <svg width="180" height="180" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="9.5"
          fill="none"
          stroke="#2a2a2e"
          strokeWidth="3"
        />
        <path
          d="M16 6.5a9.5 9.5 0 1 1-9.5 9.5"
          fill="none"
          stroke="#f97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m12 16 3 3 5-6"
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size
  )
}
