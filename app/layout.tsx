import type { Metadata } from "next"
import Script from "next/script"
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Space_Grotesk,
} from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { DemoToaster } from "@/components/site/layout/toaster"
import { Footer } from "@/components/site/layout/footer"
import { Header } from "@/components/site/layout/header"
import { siteUrl } from "@/lib/site/config"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const fontSans = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-space-grotesk",
})

const fontMono = Atkinson_Hyperlegible_Mono({
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
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="07b2fcd9-52fb-4fe8-aa0f-7a9e24ff6557"
          data-domains="sureui.com"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <div className="flex min-h-svh flex-col bg-(--paper) text-(--ink)">
            <Header />
            {children}
            <Footer />
          </div>
          <DemoToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
