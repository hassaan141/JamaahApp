import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import * as Location from 'expo-location'
import { getUserId } from '@/Utils/getUserID'
import { setAuto } from '@/Utils/switchMasjidMode'
import { formatDistance } from '@/Utils/formatDistance'
import { useAuth } from '@/Auth/AuthProvider'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'
import {
  acceptBackgroundLocationDisclosure,
  hasAcceptedBackgroundLocationDisclosure,
} from '@/Utils/BackgroundLocationTask'

interface Props {
  visible: boolean
  onClose: () => void
  masjidData?: { org?: { name?: string }; distance_m?: number | null } | null
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void
  }
  onRefreshPrayerTimes?: () => void
  activeMode?: 'pinned' | 'auto' | 'guest'
}

const MasjidDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  masjidData,
  navigation,
  onRefreshPrayerTimes,
  activeMode = 'pinned',
}) => {
  const { session } = useAuth()
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()
  const [loading, setLoading] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(true)
  const [showBackgroundDisclosure, setShowBackgroundDisclosure] =
    useState(false)

  const isGuest = !session

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
    if (isGuest) {
      onClose()
      navigation.navigate('SignIn')
      return
    }
    onClose()
    navigation.navigate('Masjids', { showBackButton: true })
  }

  const proceedWithNearestMasjid = async () => {
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

  const handleUseNearestMasjid = async () => {
    if (isGuest) {
      onClose()
      navigation.navigate('SignIn')
      return
    }

    // Check location permission first
    const { status } = await Location.getForegroundPermissionsAsync()

    if (status !== 'granted') {
      // Open device settings so user can enable location
      Linking.openSettings()
      return
    }

    if (Platform.OS === 'android') {
      const disclosureAccepted = await hasAcceptedBackgroundLocationDisclosure()
      if (!disclosureAccepted) {
        setShowBackgroundDisclosure(true)
        return
      }
    }

    await proceedWithNearestMasjid()
  }

  const handleAcceptDisclosure = async () => {
    setShowBackgroundDisclosure(false)
    await acceptBackgroundLocationDisclosure()
    await proceedWithNearestMasjid()
  }

  const handleGuestSignIn = () => {
    onClose()
    navigation.navigate('UserTypeSelection')
  }

  const isPinnedActive = activeMode === 'pinned'
  const isAutoActive = activeMode === 'auto'
  const isGuestMode = activeMode === 'guest'

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Masjid Settings
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeIconButton,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
                onPress={onClose}
              >
                <Feather name="x" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {isGuest ? (
              // Guest mode: Show sign-up prompt
              <>
                <View style={styles.guestPromptContainer}>
                  <View
                    style={[
                      styles.guestIconCircle,
                      {
                        backgroundColor: theme.colors.primarySoft,
                        borderColor: theme.colors.primaryBorder,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.guestPromptTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Sign up to customize
                  </Text>
                  <Text
                    style={[
                      styles.guestPromptText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Create an account to pin your favorite masjid and get
                    personalized prayer notifications
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.guestSignUpButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleGuestSignIn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.guestSignUpButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.currentMasjidSection}>
                  <Text
                    style={[
                      styles.currentLabel,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Currently showing:
                  </Text>
                  <View style={styles.currentMasjidInfo}>
                    <Feather
                      name="map-pin"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.currentMasjidName,
                        { color: theme.colors.text },
                      ]}
                    >
                      {masjidData?.org?.name || 'Nearest Masjid'}
                    </Text>
                    {masjidData?.distance_m != null && (
                      <Text
                        style={[
                          styles.currentDistance,
                          { color: theme.colors.textMuted },
                        ]}
                      >
                        • {formatDistance(masjidData?.distance_m, unit)}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            ) : (
              // Logged-in user: Show normal options
              <>
                <Text
                  style={[styles.subtitle, { color: theme.colors.textMuted }]}
                >
                  Choose how you'd like to receive prayer times and
                  notifications
                </Text>

                {/* Option 1: Pinned / Specific */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    },
                    isPinnedActive && styles.activeOptionPinned,
                    isPinnedActive && {
                      backgroundColor: theme.colors.primarySoft,
                      borderColor: theme.colors.primaryBorder,
                    },
                  ]}
                  onPress={handleChooseSpecificMasjid}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
                    <Feather
                      name="map-pin"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Choose Specific Masjid
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      Select a masjid to always get its prayer times
                    </Text>
                  </View>
                  {isPinnedActive ? (
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={theme.colors.primary}
                    />
                  ) : (
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={theme.colors.textSoft}
                    />
                  )}
                </TouchableOpacity>

                {/* Option 2: Auto / Nearest */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    },
                    isAutoActive && styles.activeOptionAuto,
                    isAutoActive && {
                      backgroundColor: '#4C3A1F',
                      borderColor: '#7A5A2A',
                    },
                    !locationPermissionGranted && styles.disabledOption,
                  ]}
                  onPress={handleUseNearestMasjid}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
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
                        { color: theme.colors.text },
                        !locationPermissionGranted && styles.disabledText,
                      ]}
                    >
                      Use Nearest Masjid
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textMuted },
                      ]}
                    >
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
                      color={isAutoActive ? '#F6AD55' : theme.colors.textSoft}
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.currentMasjidSection}>
                  <Text
                    style={[
                      styles.currentLabel,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Currently using:
                  </Text>
                  <View style={styles.currentMasjidInfo}>
                    <Feather
                      name={
                        isAutoActive || isGuestMode ? 'navigation' : 'map-pin'
                      }
                      size={16}
                      color={
                        isAutoActive || isGuestMode ? '#F6AD55' : '#48BB78'
                      }
                    />
                    <Text
                      style={[
                        styles.currentMasjidName,
                        { color: theme.colors.text },
                      ]}
                    >
                      {masjidData?.org?.name || 'Loading...'}
                    </Text>
                    <Text
                      style={[
                        styles.currentDistance,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      • {formatDistance(masjidData?.distance_m, unit)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showBackgroundDisclosure}
        onRequestClose={() => setShowBackgroundDisclosure(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.disclosureCard,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View
              style={[
                styles.disclosureIconWrap,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.primaryBorder,
                },
              ]}
            >
              <Feather
                name="navigation"
                size={20}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={[styles.disclosureTitle, { color: theme.colors.text }]}
            >
              Background location access
            </Text>
            <Text
              style={[styles.disclosureBody, { color: theme.colors.textMuted }]}
            >
              Jamaah collects location data to update your nearest masjid and
              prayer times even when the app is closed or not in use.
            </Text>

            <View style={styles.disclosureActions}>
              <TouchableOpacity
                style={[
                  styles.disclosureSecondaryButton,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setShowBackgroundDisclosure(false)}
              >
                <Text
                  style={[
                    styles.disclosureSecondaryButtonText,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Not now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.disclosurePrimaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleAcceptDisclosure}
              >
                <Text style={styles.disclosurePrimaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
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
    borderWidth: 1,
    borderRadius: 10,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
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
  // Guest mode styles
  guestPromptContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestPromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  guestPromptText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  guestSignUpButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  guestSignUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclosureCard: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  disclosureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  disclosureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  disclosureBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  disclosureActions: {
    flexDirection: 'row',
    gap: 10,
  },
  disclosureSecondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosureSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disclosurePrimaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosurePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

export default MasjidDetailsModal
