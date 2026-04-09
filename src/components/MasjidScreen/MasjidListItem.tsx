import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'
import { formatDistanceFromKm } from '@/Utils/distance'

export default function MasjidListItem({
  item,
  onPress,
}: {
  item: { id: string; name: string; address: string; distance_km?: number }
  onPress: () => void
}) {
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()
  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.addr, { color: theme.colors.textMuted }]}>
          {item.address}
        </Text>
      </View>
      <View style={styles.dist}>
        <Feather
          name="map-pin"
          size={16}
          color={theme.colors.textSoft}
          style={styles.icon}
        />
        <Text style={[styles.distText, { color: theme.colors.textMuted }]}>
          {formatDistanceFromKm(item?.distance_km, unit)}
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  addr: { fontSize: 14 },
  dist: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 4 },
  distText: { fontSize: 14 },
})
