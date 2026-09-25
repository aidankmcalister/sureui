import Link from "next/link"

import { githubUrl } from "@/components/site/families"
import { ThemeToggle } from "@/components/site/theme-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 text-sm">
        <Link href="/" className="mr-auto font-medium">
          SureUI
        </Link>
        <Link
          href="/docs"
          className="text-muted-foreground hover:text-foreground"
        >
          Docs
        </Link>
        <a
          href={githubUrl}
          className="text-muted-foreground hover:text-foreground"
        >
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
