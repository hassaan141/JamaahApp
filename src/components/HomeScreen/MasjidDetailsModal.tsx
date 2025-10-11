import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
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
}

const MasjidDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  masjidData,
  navigation,
  onRefreshPrayerTimes,
}) => {
  const handleChooseSpecificMasjid = () => {
    onClose()
    navigation.navigate('Masjids', { showBackButton: true })
  }

  const handleUseNearestMasjid = async () => {
    try {
      const userID = await getUserId()
      await setAuto(userID)
      onClose?.()
      onRefreshPrayerTimes?.()
    } catch (e) {
      console.log('Use nearest failed:', e)
    }
  }

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

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleChooseSpecificMasjid}
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
            <Feather name="chevron-right" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleUseNearestMasjid}
          >
            <View style={styles.optionIcon}>
              <Feather name="navigation" size={20} color="#F6AD55" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Use Nearest Masjid</Text>
              <Text style={styles.optionDescription}>
                Always show the closest masjid to your location
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <View style={styles.currentMasjidSection}>
            <Text style={styles.currentLabel}>Currently using:</Text>
            <View style={styles.currentMasjidInfo}>
              <Feather name="map-pin" size={16} color="#48BB78" />
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
