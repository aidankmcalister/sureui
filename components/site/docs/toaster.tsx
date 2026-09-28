"use client"

import dynamic from "next/dynamic"

export const DemoToaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
)
