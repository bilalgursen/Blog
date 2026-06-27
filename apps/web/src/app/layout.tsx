import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/src/components/theme-provider"
import { CustomCursor } from "@/src/components/shared/custom-cursor"
import { CornerIcons } from "@/src/components/shared/corner-icons"
import { cn } from "@/src/lib/utils";

const instrumentSerifHeading = Instrument_Serif({subsets:['latin'],weight:['400'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, instrumentSerifHeading.variable)}
    >
      {/* suppressHydrationWarning: ColorZilla gibi tarayıcı eklentileri body'ye
          `cz-shortcut-listen` vb. öznitelik enjekte edip hydration uyarısı üretir. */}
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CustomCursor />
          <CornerIcons />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
