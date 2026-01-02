import React from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker'

interface TimeInputProps {
  label: string
  time: string | null
  setTime: (t: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function TimeInput({
  label,
  time,
  setTime,
  isOpen,
  onToggle,
}: TimeInputProps) {
  // Helper to create a valid Date object from various time string formats (HH:mm or HH:mm:ss)
  const getDateFromTimeString = (timeString: string | null): Date => {
    if (!timeString) {
      return new Date() // Default to now if time is null
    }
    // Take the first 5 characters ("HH:mm") to handle formats like "14:30:00"
    const formattedTime = timeString.substring(0, 5)
    const date = new Date(`2000-01-01T${formattedTime}:00`)

    // Fallback to current date if parsing still results in an invalid date
    if (isNaN(date.getTime())) {
      console.warn(`Invalid time string received: ${timeString}`)
      return new Date()
    }
    return date
  }

  const dateValue = getDateFromTimeString(time)

  const displayTime = time
    ? dateValue.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Select Time'

  const handleChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      onToggle()
    }

    if (event.type === 'set' || Platform.OS === 'ios') {
      if (selectedTime) {
        const hours = selectedTime.getHours().toString().padStart(2, '0')
        const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
        setTime(`${hours}:${minutes}`)
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={{
          backgroundColor: isOpen ? '#F0FFF4' : '#F8F9FA',
          borderColor: isOpen ? '#2F855A' : '#DEE2E6',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginBottom: isOpen ? 4 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: isOpen ? 'rgba(47, 133, 90, 0.1)' : '#E9ECEF',
              borderRadius: 6,
              padding: 6,
              marginRight: 10,
            }}
          >
            <Feather
              name="clock"
              size={16}
              color={isOpen ? '#2F855A' : '#6C757D'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                color: '#6C757D',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#1D4732',
                marginTop: 2,
              }}
            >
              {displayTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E9ECEF',
            overflow: 'hidden',
            marginBottom: 12,
            height: 130,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <DateTimePicker
            value={dateValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            textColor="#1D4732"
            accentColor="#2F855A"
            style={{
              width: 320,
              marginLeft: -10,
              transform: [{ scale: 0.75 }],
            }}
          />
        </View>
      )}
    </View>
  )
}
