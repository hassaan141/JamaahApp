import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useProfile } from '@/Auth/fetchProfile'
import { toast } from '@/components/Toast/toast'

type NotificationType = 'none' | 'adhan' | 'events_adhan'

export default function Notifications() {
  const navigation = useNavigation()
  const { profile, loading: profileLoading } = useProfile()
  const [loading, setLoading] = useState(false)
  const [notificationType, setNotificationType] =
    useState<NotificationType>('none')

  useEffect(() => {
    // Load user's current notification preference
    // For now, defaulting to 'none' - you can add a field to the profile later
    setNotificationType('none')
  }, [profile])

  const notificationOptions = [
    {
      type: 'none' as NotificationType,
      title: 'No Notifications',
      description: 'Turn off all push notifications',
      icon: 'bell-off' as const,
      color: '#6C757D',
    },
    {
      type: 'adhan' as NotificationType,
      title: 'Adhan Only',
      description: 'Receive prayer time notifications only',
      icon: 'clock' as const,
      color: '#2F855A',
    },
    {
      type: 'events_adhan' as NotificationType,
      title: 'Events + Adhan',
      description: 'Get notifications for events and prayer times',
      icon: 'bell' as const,
      color: '#3182CE',
    },
  ]

  const handleSaveNotificationSettings = async () => {
    setLoading(true)
    try {
      // Here you would update the user's notification preferences
      // For now, just showing success
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast.success('Notification settings updated!', 'Success')
    } catch {
      toast.error('Failed to update notification settings', 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F855A" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#1D4732" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Choose what notifications you'd like to receive
          </Text>

          {notificationOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.optionCard,
                notificationType === option.type && styles.selectedOption,
              ]}
              onPress={() => setNotificationType(option.type)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <Feather name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      notificationType === option.type && styles.radioSelected,
                    ]}
                  >
                    {notificationType === option.type && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>Advanced Settings</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="info" size={16} color="#3182CE" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Prayer Time Notifications</Text>
              <Text style={styles.infoText}>
                Notifications will be sent 5 minutes before each prayer time
                based on your location
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="calendar" size={16} color="#805AD5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Event Notifications</Text>
              <Text style={styles.infoText}>
                Get notified about events from organizations you follow
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveNotificationSettings}
          disabled={loading}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  selectedOption: {
    borderColor: '#2F855A',
    backgroundColor: '#F0FDF4',
  },
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
  },
})
