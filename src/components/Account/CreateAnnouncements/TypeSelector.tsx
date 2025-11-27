import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

interface TypeSelectorProps {
  postType: string | null
  setPostType: (type: string | null) => void
}

export default function TypeSelector({
  postType,
  setPostType,
}: TypeSelectorProps) {
  const types = [
    { label: 'Event', value: 'Event' },
    { label: 'Class', value: 'Repeating_classes' },
    { label: 'Janazah', value: 'Janazah' },
    { label: 'Volunteering', value: 'Volunteerng' },
  ]

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#1D4732',
          marginBottom: 8,
        }}
      >
        Type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {types.map((opt) => {
          const active = postType === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setPostType(active ? null : opt.value)}
              style={{
                backgroundColor: active ? '#2F855A' : '#F8F9FA',
                borderColor: active ? '#2F855A' : '#DEE2E6',
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
                  color: active ? '#FFFFFF' : '#1D4732',
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
