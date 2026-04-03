import React from 'react'
import type { TextInputProps } from 'react-native'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@/theme'

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  onSubmitEditing,
}: {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
  placeholder?: string
  onSubmitEditing?: TextInputProps['onSubmitEditing']
}) {
  const { theme } = useTheme()

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <Feather
            name="search"
            size={20}
            color={theme.colors.textSoft}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSoft}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
          />
          {!!value && (
            <TouchableOpacity
              onPress={onClear}
              style={styles.clearBtn}
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={theme.colors.textSoft} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0 },
  searchCard: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  clearBtn: { padding: 4, marginLeft: 8 },
})
