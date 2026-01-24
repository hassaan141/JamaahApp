import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import * as Location from 'expo-location'
import { getUserId } from '@/Utils/getUserID'
import { setAuto } from '@/Utils/switchMasjidMode'
import { formatDistance } from '@/Utils/formatDistance'

interface Props {
  visible: boolean
  onClose: () => void
  masjidData?: { org?: { name?: string }; distance_m?: number | null } | null
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void
  }
  onRefreshPrayerTimes?: () => void
  activeMode?: 'pinned' | 'auto'
}

const MasjidDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  masjidData,
  navigation,
  onRefreshPrayerTimes,
  activeMode = 'pinned',
}) => {
  const [loading, setLoading] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(true)

  // Check location permission when modal opens
  useEffect(() => {
    if (visible) {
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        setLocationPermissionGranted(status === 'granted')
      })
    } else {
      setLoading(false)
    }
  }, [visible])

  const handleChooseSpecificMasjid = () => {
    onClose()
    navigation.navigate('Masjids', { showBackButton: true })
  }

  const handleUseNearestMasjid = async () => {
    // Check location permission first
    const { status } = await Location.getForegroundPermissionsAsync()

    if (status !== 'granted') {
      // Open device settings so user can enable location
      Linking.openSettings()
      return
    }

    setLoading(true)
    try {
      const userID = await getUserId()
      await setAuto(userID)
      onClose?.()
      onRefreshPrayerTimes?.()
    } catch (e) {
      console.log('Use nearest failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const isPinnedActive = activeMode === 'pinned'
  const isAutoActive = activeMode === 'auto'

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Masjid Settings</Text>
            <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
              <Feather name="x" size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Choose how you'd like to receive prayer times and notifications
          </Text>

          {/* Option 1: Pinned / Specific */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              isPinnedActive && styles.activeOptionPinned,
            ]}
            onPress={handleChooseSpecificMasjid}
            disabled={loading}
          >
            <View style={styles.optionIcon}>
              <Feather name="map-pin" size={20} color="#48BB78" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Choose Specific Masjid</Text>
              <Text style={styles.optionDescription}>
                Select a masjid to always get its prayer times
              </Text>
            </View>
            {isPinnedActive ? (
              <Feather name="chevron-right" size={20} color="#48BB78" />
            ) : (
              <Feather name="chevron-right" size={20} color="#CBD5E0" />
            )}
          </TouchableOpacity>

          {/* Option 2: Auto / Nearest */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              isAutoActive && styles.activeOptionAuto,
              !locationPermissionGranted && styles.disabledOption,
            ]}
            onPress={handleUseNearestMasjid}
            disabled={loading}
          >
            <View style={styles.optionIcon}>
              <Feather
                name="navigation"
                size={20}
                color={locationPermissionGranted ? '#F6AD55' : '#A0AEC0'}
              />
            </View>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionTitle,
                  !locationPermissionGranted && styles.disabledText,
                ]}
              >
                Use Nearest Masjid
              </Text>
              <Text style={styles.optionDescription}>
                {locationPermissionGranted
                  ? 'Always show the closest masjid to your location'
                  : 'Location permission required'}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#F6AD55" />
            ) : !locationPermissionGranted ? (
              <Feather name="lock" size={18} color="#A0AEC0" />
            ) : (
              <Feather
                name="chevron-right"
                size={20}
                color={isAutoActive ? '#F6AD55' : '#CBD5E0'}
              />
            )}
          </TouchableOpacity>

          <View style={styles.currentMasjidSection}>
            <Text style={styles.currentLabel}>Currently using:</Text>
            <View style={styles.currentMasjidInfo}>
              <Feather
                name={isAutoActive ? 'navigation' : 'map-pin'}
                size={16}
                color={isAutoActive ? '#F6AD55' : '#48BB78'}
              />
              <Text style={styles.currentMasjidName}>
                {masjidData?.org?.name || 'Loading...'}
              </Text>
              <Text style={styles.currentDistance}>
                • {formatDistance(masjidData?.distance_m)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeIconButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeOptionPinned: {
    backgroundColor: '#F0FFF4',
    borderColor: '#48BB78',
  },
  activeOptionAuto: {
    backgroundColor: '#FFFAF0',
    borderColor: '#F6AD55',
  },
  disabledOption: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  disabledText: {
    color: '#A0AEC0',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 18,
  },
  currentMasjidSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  currentLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  currentMasjidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentMasjidName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 6,
  },
  currentDistance: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
})

export default MasjidDetailsModal
