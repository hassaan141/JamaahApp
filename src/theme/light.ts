import type { AppTheme } from './tokens'

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F7FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderSoft: '#EEF2F7',
    text: '#111827',
    textMuted: '#4B5563',
    textSoft: '#94A3B8',
    primary: '#2F855A',
    primarySoft: '#F0FDF4',
    primaryBorder: '#DCFCE7',
    success: '#2F855A',
    danger: '#E46A6A',
    overlay: 'rgba(15, 23, 42, 0.4)',
    shadow: '#000000',
  },
  radii: {
    sm: 8,
    md: 10,
    lg: 12,
  },
}
