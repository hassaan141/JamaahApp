import React from 'react'
import type {
  TextInputProps} from 'react-native';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function MasjidSearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search masjids by name or location...',
  onSubmitEditing,
}: {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
  placeholder?: string
  onSubmitEditing?: TextInputProps['onSubmitEditing']
}) {
  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        <View style={styles.inputRow}>
          <Feather
            name="search"
            size={20}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
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
              <Feather name="x" size={18} color="#64748b" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
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
  input: { flex: 1, fontSize: 16, color: '#1e293b', paddingVertical: 0 },
  clearBtn: { padding: 4, marginLeft: 8 },
})
