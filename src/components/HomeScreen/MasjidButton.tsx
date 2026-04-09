import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MasjidDetailsModal from './MasjidDetailsModal'
import { formatDistance } from '@/Utils/formatDistance'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'

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
  activeMode?: 'pinned' | 'auto' | 'guest'
}

const MasjidButton: React.FC<Props> = ({
  prayerTimes,
  navigation,
  onRefreshPrayerTimes,
  activeMode = 'pinned', // Default to pinned if undefined
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()

  const handlePress = () => setModalVisible(true)
  const handleCloseModal = () => setModalVisible(false)

  // Dynamic Icon Logic - guest mode behaves like auto (location-based)
  const isAuto = activeMode === 'auto' || activeMode === 'guest'
  const iconName = isAuto ? 'navigation' : 'map-pin'
  const iconColor = isAuto ? '#F6AD55' : theme.colors.primary

  return (
    <>
      <TouchableOpacity
        style={[
          styles.masjidButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
        onPress={handlePress}
      >
        <View style={styles.masjidButtonContent}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            {/* Dynamic Icon */}
            <Feather name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.masjidName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {prayerTimes?.org?.name ?? 'Loading...'}
            </Text>
            <Text
              style={[styles.metaLine, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              {(prayerTimes?.org?.address ?? '') +
                (prayerTimes?.distance_m != null
                  ? ` • ${formatDistance(prayerTimes?.distance_m, unit)}`
                  : '')}
            </Text>
          </View>
          <View style={styles.chevronContainer}>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.colors.textSoft}
            />
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
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
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
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  masjidName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaLine: {
    fontSize: 12,
  },
  chevronContainer: {
    marginLeft: 10,
  },
})

export default MasjidButton
