import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
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

const THEME_MODE_STORAGE_KEY = '@jamaah_theme_mode'

export function ThemeProvider({
  children,
  initialMode = 'system',
}: {
  children: ReactNode
  initialMode?: ThemeMode
}) {
  const systemColorScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>(initialMode)

  useEffect(() => {
    let mounted = true

    const loadStoredMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)
        if (
          mounted &&
          (storedMode === 'light' ||
            storedMode === 'dark' ||
            storedMode === 'system')
        ) {
          setModeState(storedMode)
        }
      } catch (error) {
        console.warn('[ThemeProvider] Failed to load theme mode:', error)
      }
    }

    loadStoredMode()

    return () => {
      mounted = false
    }
  }, [])

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode)
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode).catch((error) => {
      console.warn('[ThemeProvider] Failed to persist theme mode:', error)
    })
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const nextMode = prev === 'dark' ? 'light' : 'dark'
      AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode).catch((error) => {
        console.warn('[ThemeProvider] Failed to persist theme mode:', error)
      })
      return nextMode
    })
  }, [])

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedMode =
      mode === 'system'
        ? systemColorScheme === 'dark'
          ? 'dark'
          : 'light'
        : mode

    return {
      theme: resolvedMode === 'dark' ? darkTheme : lightTheme,
      mode,
      setMode,
      toggleMode,
    }
  }, [mode, setMode, systemColorScheme, toggleMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
