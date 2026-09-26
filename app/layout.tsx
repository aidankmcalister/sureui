import type { Metadata } from "next"
import { Geist, Geist_Mono, Rubik, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontBody = Rubik({ subsets: ["latin"], variable: "--font-rubik" })

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
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
        fontBody.variable,
        fontDisplay.variable
      )}
    >
      <body>
        <ThemeProvider>
          <div className="flex min-h-svh flex-col bg-(--paper) font-body text-(--ink)">
            <Header />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
