import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { siteUrl } from "@/components/site/styles"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-space-grotesk",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SureUI", template: "%s · SureUI" },
  description: "Confirmation components for shadcn/ui.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable,
        fontDisplay.variable
      )}
    >
      <body>
        <Analytics />
        <SpeedInsights />
        <ThemeProvider>
          <div className="flex min-h-svh flex-col bg-(--paper) text-(--ink)">
            <Header />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
