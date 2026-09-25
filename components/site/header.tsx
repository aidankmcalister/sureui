import Link from "next/link"

import { families } from "@/components/site/families"

const links = [
  ...families.map((family) => ({
    href: `/docs/${family.slug}`,
    label: family.name,
  })),
  { href: "/docs/which-one", label: "Which one?" },
]

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-6 px-4 text-sm">
        <Link href="/" className="font-medium">
          SureUI
        </Link>
        <nav className="flex gap-4 overflow-x-auto whitespace-nowrap text-muted-foreground">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
