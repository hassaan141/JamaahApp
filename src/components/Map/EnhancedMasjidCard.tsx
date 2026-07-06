import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { MasjidItem } from '@/Hooks/useMasjidList'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'
import { formatDistanceFromKm } from '@/Utils/distance'

export default function EnhancedMasjidCard({
  item,
  onPress,
  onDirections,
}: {
  item: MasjidItem
  onPress?: () => void
  onDirections?: (it: MasjidItem) => void
}) {
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {item.name}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.locationInfo}>
          <Feather name="map-pin" size={12} color={theme.colors.textSoft} />
          <Text
            style={[styles.address, { color: theme.colors.textMuted }]}
            numberOfLines={1}
          >
            {item.address}
          </Text>
        </View>
        <Text style={[styles.distance, { color: theme.colors.textMuted }]}>
          {formatDistanceFromKm(item?.distance_km, unit)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.directionsButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={(e) => {
            e.stopPropagation()
            onDirections?.(item)
          }}
        >
          <Feather name="navigation" size={14} color="#FFFFFF" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // --- Changes Start Here ---
    borderWidth: 1,
    borderColor: '#E2E8F0', // Adds a very light gray border for a clean edge
    shadowColor: '#4A5568', // Using a softer, less intense shadow color
    shadowOffset: { width: 0, height: 4 }, // Increases the shadow's downward distance
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  address: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityTag: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  amenityText: {
    fontSize: 10,
    color: '#48BB78',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  directionsButton: {},
  directionsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
})
