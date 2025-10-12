import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { MasjidItem } from '@/Hooks/useMasjidList'

export default function EnhancedMasjidCard({
  item,
  onPress,
  onDirections,
  onCall,
}: {
  item: MasjidItem
  onPress?: () => void
  onDirections?: (it: MasjidItem) => void
  onCall?: (it: MasjidItem) => void
}) {
  const rating = (item.rating as number) || 4.5
  const amenities = (item.amenities as string[]) || [
    'Halal Food',
    'Islamic School',
    'Library',
  ]

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Feather name="star" size={12} color="#FFD700" />
          <Text style={styles.rating}>{rating}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.locationInfo}>
          <Feather name="map-pin" size={12} color="#718096" />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <Text style={styles.distance}>
          {item?.distance_km != null
            ? `${item.distance_km.toFixed(1)} mi`
            : '— mi'}
        </Text>
      </View>

      <View style={styles.amenitiesContainer}>
        {amenities.slice(0, 3).map((amenity, index) => (
          <View key={index} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={(e) => {
            e.stopPropagation()
            onDirections?.(item)
          }}
        >
          <Feather name="navigation" size={14} color="#FFFFFF" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={(e) => {
            e.stopPropagation()
            onCall?.(item)
          }}
        >
          <Feather name="phone" size={14} color="#48BB78" />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#2D3748',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 2,
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
    color: '#718096',
    marginLeft: 4,
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#718096',
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
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  directionsButton: {
    backgroundColor: '#48BB78',
  },
  callButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#48BB78',
  },
  directionsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  callText: {
    color: '#48BB78',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
})
