'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'day' | 'night'

const STORAGE_KEY = 'midnight-teahouse-theme'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'night', setTheme: () => {} })

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('night')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'day' || stored === 'night') setThemeState(stored)
    setMounted(true)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={mounted ? theme : 'night'} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
