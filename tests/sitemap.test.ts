import { describe, expect, it } from "vitest"

import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { siteUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/docs"

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url)

  it("lists the home page, every docs page, blocks and the changelog", () => {
    expect(urls).toContain(siteUrl)
    for (const page of pages) expect(urls).toContain(`${siteUrl}${page.href}`)
    expect(urls).toContain(`${siteUrl}/blocks`)
    expect(urls).toContain(`${siteUrl}/changelog`)
  })

  it("uses sureui.com without www, once each", () => {
    for (const url of urls) expect(url.startsWith(`${siteUrl}`)).toBe(true)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it("is linked from robots.txt", () => {
    expect(robots().sitemap).toBe(`${siteUrl}/sitemap.xml`)
  })
})
