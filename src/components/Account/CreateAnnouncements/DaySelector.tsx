import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

interface DaySelectorProps {
  selectedDays: number[]
  setSelectedDays: (days: number[]) => void
}

export default function DaySelector({
  selectedDays,
  setSelectedDays,
}: DaySelectorProps) {
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
          color: '#1D4732',
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
                backgroundColor: isSelected ? '#2F855A' : '#F8F9FA',
                borderColor: isSelected ? '#2F855A' : '#DEE2E6',
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
                  color: isSelected ? '#FFFFFF' : '#1D4732',
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
