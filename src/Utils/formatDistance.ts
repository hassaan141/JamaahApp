import type { DistanceUnit } from './distance'
import { formatDistanceFromMeters } from './distance'

export function formatDistance(
  meters?: number | null,
  unit: DistanceUnit = 'km',
): string {
  return formatDistanceFromMeters(meters, unit)
}
