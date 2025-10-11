import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function MasjidListItem({
  item,
  onPress,
}: {
  item: { id: string; name: string; address: string; distance_km?: number }
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.addr}>{item.address}</Text>
      </View>
      <View style={styles.dist}>
        <Feather name="map-pin" size={16} color="#718096" style={styles.icon} />
        <Text style={styles.distText}>
          {item?.distance_km != null
            ? `${item.distance_km.toFixed(1)} KM`
            : '—'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  addr: { fontSize: 14, color: '#718096' },
  dist: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 4 },
  distText: { fontSize: 14, color: '#718096' },
})
