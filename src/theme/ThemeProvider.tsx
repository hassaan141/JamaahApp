import React, { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { darkTheme } from './dark'
import { lightTheme } from './light'
import type { AppTheme, ThemeMode } from './tokens'

type ThemeContextValue = {
  theme: AppTheme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialMode = 'light',
}: {
  children: ReactNode
  initialMode?: ThemeMode
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  const value = useMemo<ThemeContextValue>(() => {
    const theme = mode === 'dark' ? darkTheme : lightTheme
    return {
      theme,
      mode,
      setMode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }
  }, [mode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
