import React from 'react'
import { View, Text, TextInput } from 'react-native'

interface DateInputProps {
  date: string | null
  setDate: (d: string | null) => void
}

export default function DateInput({ date, setDate }: DateInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#1D4732',
          marginBottom: 8,
        }}
      >
        Date
      </Text>
      <TextInput
        value={date ?? ''}
        onChangeText={(t) => setDate(t.trim() === '' ? null : t)}
        placeholder="YYYY-MM-DD"
        style={{
          borderWidth: 1,
          borderColor: '#DEE2E6',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />
    </View>
  )
}
