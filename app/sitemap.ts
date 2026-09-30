import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/docs"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...pages.map((page) => page.href), "/blocks", "/changelog"].map(
    (href) => ({ url: `${siteUrl}${href === "/" ? "" : href}` })
  )
}
