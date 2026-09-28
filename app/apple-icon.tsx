import { ImageResponse } from "next/og"

import { brand } from "@/components/site/og/brand"

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
        background: brand.paper,
      }}
    >
      <svg width="180" height="180" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="9.5"
          fill="none"
          stroke={brand.rule}
          strokeWidth="3"
        />
        <path
          d="M16 6.5a9.5 9.5 0 1 1-9.5 9.5"
          fill="none"
          stroke={brand.mark}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m12 16 3 3 5-6"
          fill="none"
          stroke={brand.ink}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size
  )
}
