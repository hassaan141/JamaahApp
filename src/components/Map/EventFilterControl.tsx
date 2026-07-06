import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@/theme'

export const EVENT_FILTER_OPTIONS = [
  { label: 'Events', value: 'Event' },
  { label: 'Classes', value: 'Repeating_classes' },
  { label: 'Janazah', value: 'Janazah' },
  { label: 'Volunteer', value: 'Volunteerng' },
] as const

export type EventFilterValue = (typeof EVENT_FILTER_OPTIONS)[number]['value']

export default function EventFilterControl({
  values,
  onChange,
}: {
  values: EventFilterValue[]
  onChange: (values: EventFilterValue[]) => void
}) {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)
  const selectedCount = values.length

  const toggleValue = (nextValue: EventFilterValue) => {
    const isSelected = values.includes(nextValue)

    if (isSelected) {
      if (values.length === 1) return
      onChange(values.filter((value) => value !== nextValue))
      return
    }

    onChange([...values, nextValue])
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Feather name="sliders" size={20} color={theme.colors.text} />
        {selectedCount > 0 && (
          <View
            style={[styles.badge, { backgroundColor: theme.colors.danger }]}
          >
            <Text style={styles.badgeText}>{selectedCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Filter Events
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterList}>
              {EVENT_FILTER_OPTIONS.map((opt) => {
                const isActive = values.includes(opt.value)
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: theme.colors.surfaceMuted,
                        borderColor: theme.colors.border,
                      },
                      isActive && styles.filterOptionActive,
                      isActive && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => toggleValue(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: theme.colors.text },
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isActive && (
                      <Feather name="check" size={18} color="#FFF" />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() =>
                  onChange(EVENT_FILTER_OPTIONS.map((option) => option.value))
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Select All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: '#F7FAFC',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E53E3E',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    maxHeight: '70%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  filterList: {
    marginBottom: 14,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  filterOptionActive: {
    backgroundColor: '#48BB78',
    borderColor: '#48BB78',
  },
  filterText: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  resetButtonText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 15,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#48BB78',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
})
