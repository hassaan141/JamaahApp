export function formatDistance(meters?: number | null): string {
  if (meters == null) return '—'
  if (meters < 1000) return `${Math.round(meters)}m`
  const km = meters / 1000
  if (km < 10) return `${km.toFixed(1)}km`
  return `${Math.round(km)}km`
}
