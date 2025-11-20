import React from 'react'
import { View, Text } from 'react-native'
import DaySelector from './DaySelector'
import DateInput from './DateInput'

interface ScheduleSectionProps {
  postType: string | null
  recurringDays: number[]
  setRecurringDays: (days: number[]) => void
  date?: string | null
  setDate?: (d: string | null) => void
}

export default function ScheduleSection({
  postType,
  recurringDays,
  setRecurringDays,
  date,
  setDate,
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

      {postType === 'Repeating_classes' ? (
        <View style={{ marginBottom: 12 }}>
          <DaySelector
            selectedDays={recurringDays}
            setSelectedDays={setRecurringDays}
          />
        </View>
      ) : (
        // For non-recurring events show a date selector (simple input)
        <View style={{ marginBottom: 12 }}>
          {setDate && date !== undefined && (
            <DateInput date={date} setDate={setDate} />
          )}
        </View>
      )}
    </View>
  )
}
