import type { Metadata } from "next"

import { InlineCode } from "@/components/site/docs/sections"
import { Band, Label } from "@/components/site/layout/frame"
import { releases } from "@/lib/site/changelog"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in each SureUI release.",
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export default function Changelog() {
  return (
    <main className="flex flex-1 flex-col">
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
          Changelog
        </h1>
        <p className="max-w-140 text-[19px] leading-7.5 text-pretty text-(--ink-muted)">
          What changed in each release. Registry items always install the latest
          version.
        </p>
      </Band>
      {releases.map((release) => (
        <Band
          key={release.version}
          grow
          className="grid gap-8 px-3 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-16"
        >
          <div
            id={`v${release.version}`}
            className="grid scroll-mt-24 content-start gap-2"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight">
              <a href={`#v${release.version}`} className="hover:text-(--mark)">
                {release.version}
              </a>
            </h2>
            <Label>
              <time dateTime={release.date}>{formatDate(release.date)}</time>
            </Label>
          </div>
          <div className="grid max-w-160 gap-10">
            <p className="text-[17px] leading-7 text-pretty">
              {release.summary}
            </p>
            {release.sections.map((section) => (
              <section key={section.label} className="grid gap-4">
                <Label>{section.label}</Label>
                <ul className="grid gap-3 text-base leading-7 text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="grid grid-cols-[16px_minmax(0,1fr)]"
                    >
                      <span aria-hidden className="text-(--mark)">
                        –
                      </span>
                      <span>
                        <InlineCode>{item}</InlineCode>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Band>
      ))}
    </main>
  )
}
