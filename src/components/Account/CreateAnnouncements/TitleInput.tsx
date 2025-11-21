import React from 'react'
import { View, Text, TextInput } from 'react-native'

interface TitleInputProps {
  title: string
  setTitle: (title: string) => void
}

export default function TitleInput({ title, setTitle }: TitleInputProps) {
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
        Title
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="E.g. Ramadan night program"
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
        }}
      />
    </View>
  )
}
