import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MockMCP",
  description: "Create remote MCP servers with mock functionality",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-svh`}
        >
          <Navbar className="fixed h-16 px-8" />
          <main className="mx-auto max-w-4xl min-h-full h-full px-4 pt-16">
            {children}
          </main>
        </body>
      </ThemeProvider>
    </html>
  )
}
