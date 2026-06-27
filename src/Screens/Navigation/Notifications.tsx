import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  AppState,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import { toast } from '@/components/Toast/toast'
import { supabase } from '@/Supabase/supabaseClient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  syncPrayerSubscription,
  checkNotificationPermissionStatus,
} from '@/Utils/pushNotifications'
import type { NotificationPreference } from '@/types/supabase'
import type { RootStackParamList } from '@/Screens/Navigation/RootNavigator'
import { useTheme } from '@/theme'
import GradientBackground from '@/components/GradientBackground'

export default function Notifications() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { session } = useAuth()
  const { profile, loading: profileLoading, refetch } = useProfile()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [notificationType, setNotificationType] =
    useState<NotificationPreference>('Event_Adhan')
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'not_determined'
  >('granted')
  const appState = useRef(AppState.currentState)

  const checkPermission = useCallback(async () => {
    const status = await checkNotificationPermissionStatus()
    setPermissionStatus(status)
  }, [])

  // Check permission on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkPermission()
    }, [checkPermission]),
  )

  // Also check when app returns from background (e.g., after visiting Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkPermission()
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [checkPermission])

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  }

  // 1. Load initial setting from profile
  useEffect(() => {
    if (profile?.notification_preference) {
      setNotificationType(
        profile.notification_preference as NotificationPreference,
      )
    }
  }, [profile])

  const notificationOptions = [
    {
      type: 'None' as NotificationPreference,
      title: 'No Notifications',
      description: 'Turn off all push notifications',
      icon: 'bell-off' as const,
      color: '#6C757D',
    },
    {
      type: 'Adhan' as NotificationPreference,
      title: 'Adhan Only',
      description: 'Receive prayer time notifications only',
      icon: 'clock' as const,
      color: '#2F855A',
    },
    {
      type: 'Event_Adhan' as NotificationPreference,
      title: 'Events + Adhan',
      description: 'Get notifications for events and prayer times',
      icon: 'bell' as const,
      color: '#3182CE',
    },
  ]

  const handleSaveNotificationSettings = async () => {
    if (!profile?.id) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preference: notificationType })
        .eq('id', profile.id)

      if (error) throw error

      const currentMasjidId = await AsyncStorage.getItem('current_prayer_topic')

      if (notificationType === 'None') {
        await syncPrayerSubscription(null)
      } else if (currentMasjidId) {
        await syncPrayerSubscription(currentMasjidId)
      }

      toast.success('Notification settings updated!', 'Success')
      if (refetch) await refetch()

      navigation.goBack()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update settings', 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Feather name="arrow-left" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Notifications
            </Text>
          </View>

          <View style={styles.guestContainer}>
            <View
              style={[
                styles.guestCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <View
                style={[
                  styles.guestIconCircle,
                  { backgroundColor: theme.colors.primarySoft },
                ]}
              >
                <Feather name="bell" size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.guestTitle, { color: theme.colors.text }]}>
                Sign in to get notifications
              </Text>
              <Text
                style={[styles.guestText, { color: theme.colors.textMuted }]}
              >
                Create an account to enable prayer time and event alerts.
              </Text>
              <TouchableOpacity
                style={[
                  styles.guestSignInButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.guestSignInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (profileLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  // ... (Rest of your JSX is exactly the same as before) ...
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {permissionStatus === 'denied' && (
            <TouchableOpacity
              style={[
                styles.permissionBanner,
                {
                  backgroundColor: '#4A2626',
                  borderColor: '#7F3434',
                },
              ]}
              onPress={openSettings}
            >
              <View
                style={[
                  styles.permissionIconContainer,
                  { backgroundColor: '#6B2D2D' },
                ]}
              >
                <Feather name="bell-off" size={24} color="#DC2626" />
              </View>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionTitle}>
                  Notifications Disabled
                </Text>
                <Text style={styles.permissionDescription}>
                  Tap here to enable notifications in Settings
                </Text>
              </View>
              <Feather
                name="external-link"
                size={20}
                color={theme.colors.textSoft}
              />
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="bell" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Notification Preferences
              </Text>
            </View>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textMuted },
              ]}
            >
              {permissionStatus === 'denied'
                ? 'Enable notifications in Settings to receive alerts'
                : "Choose what notifications you'd like to receive"}
            </Text>

            {notificationOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionCard,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceMuted,
                  },
                  notificationType === option.type && styles.selectedOption,
                  notificationType === option.type && {
                    borderColor: theme.colors.primaryBorder,
                    backgroundColor: theme.colors.primarySoft,
                  },
                  permissionStatus === 'denied' && styles.optionDisabled,
                ]}
                onPress={() => setNotificationType(option.type)}
                disabled={permissionStatus === 'denied'}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: `${option.color}15` },
                    ]}
                  >
                    <Feather
                      name={option.icon}
                      size={24}
                      color={option.color}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: theme.colors.border },
                        notificationType === option.type &&
                          styles.radioSelected,
                        notificationType === option.type && {
                          borderColor: theme.colors.primary,
                        },
                      ]}
                    >
                      {notificationType === option.type && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.shadow,
              },
              (loading || permissionStatus === 'denied') &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSaveNotificationSettings}
            disabled={loading || permissionStatus === 'denied'}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {},
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 18,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2F855A',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F855A',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#2F855A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  guestCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  guestIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  guestSignInButton: {
    minWidth: 140,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSignInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  permissionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  optionDisabled: {
    opacity: 0.5,
  },
})
