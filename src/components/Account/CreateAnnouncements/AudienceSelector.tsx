import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme'

interface AudienceSelectorProps {
  demographic: string | null
  setDemographic: (demographic: string | null) => void
}

export default function AudienceSelector({
  demographic,
  setDemographic,
}: AudienceSelectorProps) {
  const { theme } = useTheme()
  const audiences = [
    { label: 'Men', value: 'Brothers' },
    { label: 'Women', value: 'Sisters' },
    { label: 'Mixed', value: 'Mixed' },
  ]

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Audience
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {audiences.map((opt) => {
          const active = demographic === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setDemographic(active ? null : opt.value)}
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
