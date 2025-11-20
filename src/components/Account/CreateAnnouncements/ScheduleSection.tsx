import React from 'react'
import { View, Text } from 'react-native'
import DaySelector from './DaySelector'

interface ScheduleSectionProps {
  postType: string | null
  recurringDays: number[]
  setRecurringDays: (days: number[]) => void
}

export default function ScheduleSection({
  postType,
  recurringDays,
  setRecurringDays,
}: ScheduleSectionProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#1D4732',
          marginBottom: 10,
        }}
      >
        Schedule
      </Text>

      {postType === 'Repeating_classes' && (
        <View style={{ marginBottom: 12 }}>
          <DaySelector
            selectedDays={recurringDays}
            setSelectedDays={setRecurringDays}
          />
        </View>
      )}
    </View>
  )
}
