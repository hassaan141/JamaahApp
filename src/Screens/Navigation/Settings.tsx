import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useProfile } from '@/Auth/fetchProfile'
import { updateProfile } from '@/Supabase/updateProfile'
import { updateOrganization } from '@/Supabase/updateOrganization'
import { deleteAccount } from '@/Supabase/deleteAccount'
import { fetchOrganizationByProfileId } from '@/Supabase/fetchOrgFromProfileId'
import { toast } from '@/components/Toast/toast'
import type { Database } from '@/types/supabase'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function Settings() {
  const navigation = useNavigation()
  const { profile, loading: profileLoading, refetch } = useProfile()
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)

  // Profile form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Organization form state
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [orgContactName, setOrgContactName] = useState('')
  const [orgContactPhone, setOrgContactPhone] = useState('')
  const [orgContactEmail, setOrgContactEmail] = useState('')
  const [orgWebsite, setOrgWebsite] = useState('')
  const [orgFacebook, setOrgFacebook] = useState('')
  const [orgInstagram, setOrgInstagram] = useState('')
  const [orgTwitter, setOrgTwitter] = useState('')

  const isOrganization = profile?.is_org === true && !!profile?.org_id

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
    }
  }, [profile])

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!isOrganization || !profile?.org_id) return

      try {
        const org = await fetchOrganizationByProfileId()
        if (org) {
          setOrganization(org)
          setOrgName(org.name || '')
          setOrgDescription(org.description || '')
          setOrgContactName(org.contact_name || '')
          setOrgContactPhone(org.contact_phone || '')
          setOrgContactEmail(org.contact_email || '')
          setOrgWebsite(org.website || '')
          setOrgFacebook(org.facebook || '')
          setOrgInstagram(org.instagram || '')
          setOrgTwitter(org.twitter || '')
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }

    fetchOrganization()
  }, [isOrganization, profile?.org_id])

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

  const handleUpdateOrganization = async () => {
    if (!organization?.id) return

    setLoading(true)
    try {
      const { ok, error } = await updateOrganization(organization.id, {
        name: orgName.trim(),
        description: orgDescription.trim() || null,
        contact_name: orgContactName.trim(),
        contact_phone: orgContactPhone.trim(),
        contact_email: orgContactEmail.trim(),
        website: orgWebsite.trim() || null,
        facebook: orgFacebook.trim() || null,
        instagram: orgInstagram.trim() || null,
        twitter: orgTwitter.trim() || null,
      })

      if (ok) {
        toast.success('Organization updated successfully!', 'Success')
      } else {
        toast.error(error || 'Failed to update organization', 'Error')
      }
    } catch {
      toast.error('Failed to update organization', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              const { ok, error } = await deleteAccount()
              if (!ok) {
                toast.error(error || 'Failed to delete account', 'Error')
                setLoading(false)
              }
              // If successful, user will be signed out automatically
            } catch {
              toast.error('Failed to delete account', 'Error')
              setLoading(false)
            }
          },
        },
      ],
    )
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F855A" />
          <Text style={styles.loadingText}>Loading settings...</Text>
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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>Profile Settings</Text>
          </View>

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

        {/* Organization Settings Section - Only for organizations */}
        {isOrganization && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={20} color="#2F855A" />
              <Text style={styles.sectionTitle}>Organization Settings</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization Name</Text>
              <TextInput
                style={styles.input}
                value={orgName}
                onChangeText={setOrgName}
                placeholder="Enter organization name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={orgDescription}
                onChangeText={setOrgDescription}
                placeholder="Enter organization description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Name</Text>
              <TextInput
                style={styles.input}
                value={orgContactName}
                onChangeText={setOrgContactName}
                placeholder="Enter contact person name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={orgContactPhone}
                onChangeText={setOrgContactPhone}
                placeholder="Enter contact phone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                value={orgContactEmail}
                onChangeText={setOrgContactEmail}
                placeholder="Enter contact email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={orgWebsite}
                onChangeText={setOrgWebsite}
                placeholder="Enter website URL"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facebook</Text>
              <TextInput
                style={styles.input}
                value={orgFacebook}
                onChangeText={setOrgFacebook}
                placeholder="Enter Facebook URL"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={orgInstagram}
                onChangeText={setOrgInstagram}
                placeholder="Enter Instagram URL"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Twitter</Text>
              <TextInput
                style={styles.input}
                value={orgTwitter}
                onChangeText={setOrgTwitter}
                placeholder="Enter Twitter URL"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleUpdateOrganization}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Update Organization
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Account Actions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={20} color="#E53E3E" />
            <Text style={styles.sectionTitle}>Account Actions</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
    marginLeft: 10,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  dangerButton: {
    backgroundColor: '#E53E3E',
  },
  dangerButtonText: {
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
})
