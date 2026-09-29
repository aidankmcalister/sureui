import Link from "next/link"

import { linkEvent } from "@/lib/site/analytics"

export function SiteLink({
  href,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        {...linkEvent(href)}
        {...props}
      />
    )
  }
  if (/\.\w+$/.test(href))
    return <a href={href} {...linkEvent(href)} {...props} />
  return <Link href={href} {...props} />
}
