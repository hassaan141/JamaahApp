import React from 'react'
import { View, TextInput } from 'react-native'
import { useTheme } from '@/theme'
import RequiredLabel from './RequiredLabel'

interface DescriptionInputProps {
  description: string
  setDescription: (description: string) => void
}

export default function DescriptionInput({
  description,
  setDescription,
}: DescriptionInputProps) {
  const { theme } = useTheme()

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
        Description
      </RequiredLabel>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add timing, location, or supporting notes"
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
          minHeight: 100,
          textAlignVertical: 'top',
        }}
        multiline
        numberOfLines={4}
      />
    </View>
  )
}
