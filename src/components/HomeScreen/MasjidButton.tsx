import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MasjidDetailsModal from './MasjidDetailsModal'
import { formatDistance } from '@/Utils/formatDistance'

export type PrayerTimesWithOrg = {
  org?: { id?: string; name?: string; address?: string }
  distance_m?: number | null
  [key: string]: unknown
}

interface Props {
  prayerTimes?: PrayerTimesWithOrg | null
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void
  }
  onRefreshPrayerTimes?: () => void
  // NEW: Prop to know which mode we are in
  activeMode?: 'pinned' | 'auto'
}

const MasjidButton: React.FC<Props> = ({
  prayerTimes,
  navigation,
  onRefreshPrayerTimes,
  activeMode = 'pinned', // Default to pinned if undefined
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const handlePress = () => setModalVisible(true)
  const handleCloseModal = () => setModalVisible(false)

  // Dynamic Icon Logic
  const isAuto = activeMode === 'auto'
  const iconName = isAuto ? 'navigation' : 'map-pin'
  const iconColor = isAuto ? '#F6AD55' : '#48BB78' // Orange for Auto, Green for Pinned

  return (
    <>
      <TouchableOpacity style={styles.masjidButton} onPress={handlePress}>
        <View style={styles.masjidButtonContent}>
          <View style={styles.iconContainer}>
            {/* Dynamic Icon */}
            <Feather name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.masjidName} numberOfLines={1}>
              {prayerTimes?.org?.name ?? 'Loading...'}
            </Text>
            <Text style={styles.metaLine} numberOfLines={1}>
              {(prayerTimes?.org?.address ?? '') +
                (prayerTimes?.distance_m != null
                  ? ` • ${formatDistance(prayerTimes?.distance_m)}`
                  : '')}
            </Text>
          </View>
          <View style={styles.chevronContainer}>
            <Feather name="chevron-right" size={18} color="#2D3748" />
          </View>
        </View>
      </TouchableOpacity>

      <MasjidDetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        masjidData={prayerTimes}
        navigation={navigation}
        onRefreshPrayerTimes={onRefreshPrayerTimes}
        activeMode={activeMode} // Pass mode to modal
      />
    </>
  )
}

const styles = StyleSheet.create({
  masjidButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  masjidButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    // Optional: Add a subtle border to match the clean look
    borderWidth: 1,
    borderColor: '#F7FAFC',
  },
  textContainer: {
    flex: 1,
  },
  masjidName: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 2,
  },
  metaLine: {
    fontSize: 12,
    color: '#4A5568',
  },
  chevronContainer: {
    marginLeft: 10,
  },
})

export default MasjidButton
