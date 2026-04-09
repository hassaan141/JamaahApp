import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { DistanceUnit } from '@/Utils/distance'

type DistanceUnitContextValue = {
  unit: DistanceUnit
  setUnit: (unit: DistanceUnit) => void
}

const DISTANCE_UNIT_STORAGE_KEY = '@jamaah_distance_unit'

const DistanceUnitContext = createContext<DistanceUnitContextValue | null>(null)

export function DistanceUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<DistanceUnit>('km')

  useEffect(() => {
    let mounted = true

    const loadStoredUnit = async () => {
      try {
        const stored = await AsyncStorage.getItem(DISTANCE_UNIT_STORAGE_KEY)
        if (mounted && (stored === 'km' || stored === 'mi')) {
          setUnitState(stored)
        }
      } catch (error) {
        console.warn('[DistanceUnitProvider] Failed to load unit:', error)
      }
    }

    loadStoredUnit()

    return () => {
      mounted = false
    }
  }, [])

  const setUnit = useCallback((nextUnit: DistanceUnit) => {
    setUnitState(nextUnit)
    AsyncStorage.setItem(DISTANCE_UNIT_STORAGE_KEY, nextUnit).catch((error) => {
      console.warn('[DistanceUnitProvider] Failed to persist unit:', error)
    })
  }, [])

  const value = useMemo<DistanceUnitContextValue>(
    () => ({ unit, setUnit }),
    [setUnit, unit],
  )

  return (
    <DistanceUnitContext.Provider value={value}>
      {children}
    </DistanceUnitContext.Provider>
  )
}

export function useDistanceUnit() {
  const context = useContext(DistanceUnitContext)
  if (!context) {
    throw new Error('useDistanceUnit must be used within DistanceUnitProvider')
  }
  return context
}
