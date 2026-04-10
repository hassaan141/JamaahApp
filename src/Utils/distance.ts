export type DistanceUnit = 'km' | 'mi'

const KM_TO_MI = 0.621371

export function formatDistanceFromKm(
  kilometers?: number | null,
  unit: DistanceUnit = 'km',
): string {
  if (kilometers == null) return '—'

  if (unit === 'mi') {
    const miles = kilometers * KM_TO_MI
    return `${miles.toFixed(1)} mi`
  }

  return `${kilometers.toFixed(1)} KM`
}

export function formatDistanceFromMeters(
  meters?: number | null,
  unit: DistanceUnit = 'km',
): string {
  if (meters == null) return '—'

  const kilometers = meters / 1000
  return formatDistanceFromKm(kilometers, unit)
}
