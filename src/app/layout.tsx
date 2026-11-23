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
        {/* Applies the stored theme before first paint so light-mode visitors
            never see a dark flash. Kept out of the client providers because
            React 19 does not hydrate inline scripts rendered by components. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var e=document.documentElement.classList;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t="dark"}e.remove("light","dark");e.add(t)}catch(x){e.add("dark")}})()`,
          }}
        />
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
