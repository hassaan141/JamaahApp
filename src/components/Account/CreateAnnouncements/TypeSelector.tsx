import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme'
import RequiredLabel from './RequiredLabel'

interface TypeSelectorProps {
  postType: string | null
  setPostType: (type: string | null) => void
}

export default function TypeSelector({
  postType,
  setPostType,
}: TypeSelectorProps) {
  const { theme } = useTheme()
  const types = [
    { label: 'Event', value: 'Event' },
    { label: 'Class', value: 'Repeating_classes' },
    { label: 'Janazah', value: 'Janazah' },
    { label: 'Volunteering', value: 'Volunteerng' },
  ]

  return (
    <View style={{ marginBottom: 16 }}>
      <RequiredLabel
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Type
      </RequiredLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {types.map((opt) => {
          const active = postType === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setPostType(opt.value)}
              style={{
                backgroundColor: active
                  ? theme.colors.primary
                  : theme.colors.surfaceMuted,
                borderColor: active
                  ? theme.colors.primary
                  : theme.colors.border,
                borderWidth: 1,
                borderRadius: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: active ? theme.colors.surface : theme.colors.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
