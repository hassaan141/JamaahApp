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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useProfile } from '@/Auth/fetchProfile'
import { updateOrganization } from '@/Supabase/updateOrganization'
import { fetchOrganizationByProfileId } from '@/Supabase/fetchOrgFromProfileId'
import { toast } from '@/components/Toast/toast'
import type { Database } from '@/types/supabase'
import { useTheme } from '@/theme'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function AccountSettings() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const { profile, loading: profileLoading } = useProfile()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)

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

  if (profileLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.background,
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
            Account Settings
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {isOrganization && (
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
                <Feather
                  name="briefcase"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Organization Settings
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Organization Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder="Enter organization name"
                  placeholderTextColor={theme.colors.textSoft}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgDescription}
                  onChangeText={setOrgDescription}
                  placeholder="Enter organization description"
                  placeholderTextColor={theme.colors.textSoft}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Contact Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgContactName}
                  onChangeText={setOrgContactName}
                  placeholder="Enter contact person name"
                  placeholderTextColor={theme.colors.textSoft}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Contact Phone
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgContactPhone}
                  onChangeText={setOrgContactPhone}
                  placeholder="Enter contact phone"
                  placeholderTextColor={theme.colors.textSoft}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Contact Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgContactEmail}
                  onChangeText={setOrgContactEmail}
                  placeholder="Enter contact email"
                  placeholderTextColor={theme.colors.textSoft}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Website
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgWebsite}
                  onChangeText={setOrgWebsite}
                  placeholder="Enter website URL"
                  placeholderTextColor={theme.colors.textSoft}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Facebook
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgFacebook}
                  onChangeText={setOrgFacebook}
                  placeholder="Enter Facebook URL"
                  placeholderTextColor={theme.colors.textSoft}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Instagram
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgInstagram}
                  onChangeText={setOrgInstagram}
                  placeholder="Enter Instagram URL"
                  placeholderTextColor={theme.colors.textSoft}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Twitter
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                      color: theme.colors.text,
                    },
                  ]}
                  value={orgTwitter}
                  onChangeText={setOrgTwitter}
                  placeholder="Enter Twitter URL"
                  placeholderTextColor={theme.colors.textSoft}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
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
