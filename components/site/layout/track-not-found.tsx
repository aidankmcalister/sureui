"use client"

import * as React from "react"

import { track } from "@/lib/site/analytics"

export function TrackNotFound() {
  React.useEffect(() => {
    track("not-found", { path: window.location.pathname })
  }, [])
  return null
}
