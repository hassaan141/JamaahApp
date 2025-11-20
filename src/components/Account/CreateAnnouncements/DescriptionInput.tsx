import React from 'react'
import { View, Text, TextInput } from 'react-native'

interface DescriptionInputProps {
  description: string
  setDescription: (description: string) => void
}

export default function DescriptionInput({
  description,
  setDescription,
}: DescriptionInputProps) {
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
        Description
      </Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add timing, location, or supporting notes"
        placeholderTextColor="#6C757D"
        style={{
          backgroundColor: '#F8F9FA',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#DEE2E6',
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 15,
          color: '#1D4732',
          minHeight: 100,
          textAlignVertical: 'top',
        }}
        multiline
        numberOfLines={4}
      />
    </View>
  )
}
