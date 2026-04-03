export type ThemeMode = 'light' | 'dark' | 'system'

export type AppTheme = {
  mode: 'light' | 'dark'
  colors: {
    background: string
    surface: string
    surfaceMuted: string
    surfaceElevated: string
    border: string
    borderSoft: string
    text: string
    textMuted: string
    textSoft: string
    primary: string
    primarySoft: string
    primaryBorder: string
    success: string
    danger: string
    overlay: string
    shadow: string
  }
  radii: {
    sm: number
    md: number
    lg: number
  }
}
