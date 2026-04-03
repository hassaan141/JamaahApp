import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { useTheme } from '@/theme'

interface TitleInputProps {
  title: string
  setTitle: (title: string) => void
}

export default function TitleInput({ title, setTitle }: TitleInputProps) {
  const { theme } = useTheme()

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
        Title
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="E.g. Ramadan night program"
        placeholderTextColor={theme.colors.textSoft}
        style={{
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 15,
          color: theme.colors.text,
        }}
      />
    </View>
  )
}
