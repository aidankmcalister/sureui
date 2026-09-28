"use client"

import { usePathname } from "next/navigation"

const check = "M20 6 9 17l-5-5"

export function CheckMark() {
  const pathname = usePathname()
  if (pathname.startsWith("/docs") || pathname === "/changelog") return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-240 bottom-0 z-1 overflow-clip"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="miter"
        className="absolute -right-3/5 bottom-0 aspect-square w-[160%] translate-y-[15%] text-(--mark) md:-right-1/5 md:w-[115%] lg:-right-[18%] lg:w-[90%]"
      >
        <defs>
          <pattern
            id="check-mark-hatch"
            width="0.25"
            height="0.25"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="0.25"
              stroke="currentColor"
              strokeWidth="0.07"
            />
          </pattern>
        </defs>
        <path
          d={check}
          stroke="currentColor"
          className="opacity-[0.02] dark:opacity-[0.025]"
        />
        <path
          d={check}
          stroke="url(#check-mark-hatch)"
          className="opacity-[0.1] dark:opacity-[0.13]"
        />
      </svg>
    </div>
  )
}
