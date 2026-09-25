import Link from "next/link"

export function SiteLink({
  href,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("http")) {
    return <a href={href} target="_blank" rel="noreferrer" {...props} />
  }
  return <Link href={href} {...props} />
}
