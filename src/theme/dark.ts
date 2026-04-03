import type { AppTheme } from './tokens'

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#22302A',
    surface: '#2C3A34',
    surfaceMuted: '#33423B',
    surfaceElevated: '#3A4A43',
    border: '#4A5A52',
    borderSoft: '#3C4B44',
    text: '#F4F7F3',
    textMuted: '#CDD6D0',
    textSoft: '#96A39C',
    primary: '#67B086',
    primarySoft: '#3F5C4C',
    primaryBorder: '#5E7C6B',
    success: '#67B086',
    danger: '#E46A6A',
    overlay: 'rgba(13, 18, 16, 0.4)',
    shadow: '#000000',
  },
  radii: {
    sm: 8,
    md: 10,
    lg: 12,
  },
}
