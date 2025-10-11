import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MasjidDetailsModal from './MasjidDetailsModal'
import { formatDistance } from '@/Utils/formatDistance'

export type PrayerTimesWithOrg = {
  org?: { id?: string; name?: string; address?: string }
  distance_m?: number | null
  // Allow extra fields – we only read a few here
  [key: string]: unknown
}

interface Props {
  prayerTimes?: PrayerTimesWithOrg | null
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void
  }
  onRefreshPrayerTimes?: () => void
}

const MasjidButton: React.FC<Props> = ({
  prayerTimes,
  navigation,
  onRefreshPrayerTimes,
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const handlePress = () => setModalVisible(true)
  const handleCloseModal = () => setModalVisible(false)

  return (
    <>
      <TouchableOpacity style={styles.masjidButton} onPress={handlePress}>
        <View style={styles.masjidButtonContent}>
          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={20} color="#48BB78" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.masjidName}>
              {prayerTimes?.org?.name ?? ''}
            </Text>
            <Text style={styles.masjidAddress}>
              {prayerTimes?.org?.address ?? ''}
            </Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              {formatDistance(prayerTimes?.distance_m ?? undefined)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <MasjidDetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        masjidData={prayerTimes}
        navigation={navigation}
        onRefreshPrayerTimes={onRefreshPrayerTimes}
      />
    </>
  )
}

const styles = StyleSheet.create({
  masjidButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  masjidButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  masjidName: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 4,
  },
  masjidAddress: {
    fontSize: 14,
    color: '#718096',
  },
  distanceContainer: {
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#718096',
  },
})

export default MasjidButton
