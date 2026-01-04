import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useProfile } from '@/Auth/fetchProfile'
import { updateProfile } from '@/Supabase/updateProfile'
import { deleteAccount } from '@/Supabase/deleteAccount'
import { toast } from '@/components/Toast/toast'

export default function ProfileSettings() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const { profile, loading: profileLoading, refetch } = useProfile()
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
    }
  }, [profile])

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { ok, error } = await updateProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
      })

      if (ok) {
        toast.success('Profile updated successfully!', 'Success')
        await refetch()
      } else {
        toast.error(error || 'Failed to update profile', 'Error')
      }
    } catch {
      toast.error('Failed to update profile', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    setLoading(true)

    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent and cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setLoading(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { ok, error } = await deleteAccount()
              if (ok) {
                toast.success('Account deleted', 'Success')
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                })
              } else {
                toast.error(error || 'Failed to delete account', 'Error')
                setLoading(false)
              }
            } catch {
              setLoading(false)
            }
          },
        },
      ],
      { onDismiss: () => setLoading(false) },
    )
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F855A" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#1D4732" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dangerSection}>
            <View style={styles.dangerHeader}>
              <Feather name="alert-triangle" size={20} color="#E53E3E" />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4732',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#495057',
    backgroundColor: '#FFFFFF',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2F855A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  dangerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E53E3E',
    marginLeft: 10,
  },
  dangerButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
