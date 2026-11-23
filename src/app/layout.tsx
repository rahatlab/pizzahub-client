import type { Metadata } from "next"
import { Archivo_Black, Figtree } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { SessionProviderWrapper } from "@/providers/session-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
})

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "PizzaHub — Hot. Fresh. Pizza.",
    template: "%s — PizzaHub",
  },
  description:
    "PizzaHub connects pizza lovers with approved local kitchens. Browse the menu, order, and track your delivery.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(archivo.variable, figtree.variable, "font-sans")}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              <SessionProviderWrapper>
                {children}
                <Toaster richColors position="top-right" />
              </SessionProviderWrapper>
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
