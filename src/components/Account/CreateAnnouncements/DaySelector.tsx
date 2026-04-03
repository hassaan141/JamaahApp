import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme'

interface DaySelectorProps {
  selectedDays: number[]
  setSelectedDays: (days: number[]) => void
}

export default function DaySelector({
  selectedDays,
  setSelectedDays,
}: DaySelectorProps) {
  const { theme } = useTheme()
  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 7 },
  ]

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue))
    } else {
      setSelectedDays([...selectedDays, dayValue].sort())
    }
  }

  return (
    <View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 10,
        }}
      >
        Recurring Days
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day) => {
          const isSelected = selectedDays.includes(day.value)
          return (
            <TouchableOpacity
              key={day.value}
              onPress={() => toggleDay(day.value)}
              style={{
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.surfaceMuted,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
                borderWidth: 1,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                marginBottom: 8,
                minWidth: 50,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isSelected ? theme.colors.surface : theme.colors.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
