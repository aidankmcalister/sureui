"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { SiteButton } from "@/components/site/ui/button"
import { track } from "@/lib/site/analytics"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <SiteButton
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        const to = resolvedTheme === "dark" ? "light" : "dark"
        setTheme(to)
        track("theme", { to })
      }}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </SiteButton>
  )
}
