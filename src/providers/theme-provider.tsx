"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "theme"

const listeners = new Set<() => void>()

function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// globals.css themes the reset palette on :root/.dark and light on .light, so
// the active theme name is applied as a class (dark is the default).
function applyTheme(theme: Theme) {
  const root = document.documentElement.classList
  root.remove("light", "dark")
  root.add(theme)
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
})

/**
 * Dark-first theme store. The pre-paint script in the root layout applies the
 * stored theme before hydration, and useSyncExternalStore keeps the React tree
 * on the server default during hydration so the markup still matches.
 *
 * next-themes cannot be used here: it renders an inline <script> inside its
 * client component, which React 19 will not hydrate and which breaks hydration
 * of the whole document.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readStoredTheme,
    () => "dark"
  )

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-mode browsers can reject writes; the class above still applies.
    }
    listeners.forEach((listener) => listener())
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
