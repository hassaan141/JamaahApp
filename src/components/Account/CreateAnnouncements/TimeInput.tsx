import React from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/theme'
import RequiredLabel from './RequiredLabel'
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import DateTimePicker from '@react-native-community/datetimepicker'

interface TimeInputProps {
  label: string
  required?: boolean
  time: string | null
  setTime: (t: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function TimeInput({
  label,
  required = false,
  time,
  setTime,
  isOpen,
  onToggle,
}: TimeInputProps) {
  const { theme } = useTheme()
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
          backgroundColor: isOpen
            ? theme.colors.primarySoft
            : theme.colors.surfaceMuted,
          borderColor: isOpen ? theme.colors.primary : theme.colors.border,
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginBottom: isOpen ? 4 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: isOpen
                ? theme.colors.primarySoft
                : theme.colors.borderSoft,
              borderRadius: 6,
              padding: 6,
              marginRight: 10,
            }}
          >
            <Feather
              name="clock"
              size={16}
              color={isOpen ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            {required ? (
              <RequiredLabel
                style={{
                  fontSize: 10,
                  color: theme.colors.textMuted,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </RequiredLabel>
            ) : (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.textMuted,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </Text>
            )}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.colors.text,
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
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
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
            textColor={theme.colors.text}
            accentColor={theme.colors.primary}
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
