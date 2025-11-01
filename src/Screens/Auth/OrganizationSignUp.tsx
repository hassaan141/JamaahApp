import React, { useMemo, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Dropdown } from 'react-native-element-dropdown'
import { Country, State, City } from 'country-state-city'
import { supabase } from '../../Supabase/supabaseClient'
import type { Database } from '../../types'
import { toast } from '@/components/Toast/toast'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function OrganizationSignUp({
  navigation,
}: {
  navigation: Nav
}) {
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [provinceState, setProvinceState] = useState('')
  const [provinceStateCode, setProvinceStateCode] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [prayerTimesUrl, setPrayerTimesUrl] = useState('')

  type Option = { label: string; value: string }
  const countryOptions = useMemo<Option[]>(
    () =>
      Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.isoCode,
      })),
    [],
  )
  const stateOptions = useMemo<Option[]>(() => {
    if (!countryCode) return []
    return State.getStatesOfCountry(countryCode).map((s) => ({
      label: s.name,
      value: s.isoCode,
    }))
  }, [countryCode])
  const cityOptions = useMemo<Option[]>(() => {
    if (!countryCode || !provinceStateCode) return []
    return City.getCitiesOfState(countryCode, provinceStateCode).map((ct) => ({
      label: ct.name,
      value: ct.name,
    }))
  }, [countryCode, provinceStateCode])

  const handleCountryChange = (item: Option) => {
    setCountryCode(item.value)
    setCountry(item.label)
    setProvinceState('')
    setProvinceStateCode('')
    setCity('')
  }
  const handleStateChange = (item: Option) => {
    setProvinceStateCode(item.value)
    setProvinceState(item.label)
    setCity('')
  }
  const handleCityChange = (item: Option) => {
    setCity(item.value)
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in email and password fields', 'Error')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', 'Error')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', 'Error')
      return
    }

    const requiresProvince = stateOptions.length > 0
    if (
      !name ||
      !type ||
      !address ||
      !country ||
      !contactName ||
      (requiresProvince && !provinceState)
    ) {
      const msg = requiresProvince
        ? 'Please fill in all required fields (Province/State is required for the selected country)'
        : 'Please fill in all required fields'
      toast.error(msg, 'Error')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address', 'Error')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            user_type: 'organization',
            organization_name: name,
            display_name: name,
            contact_name: contactName,
            contact_email: email,
            contact_phone: contactPhone || null,
          },
        },
      })

      if (authError) throw authError

      const organizationData: Database['public']['Tables']['organization_applications']['Insert'] =
        {
          organization_name: name,
          organization_type: type,
          contact_name: contactName,
          contact_email: email,
          address,
          city,
          country,
          application_status: 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Optional fields
          contact_phone: contactPhone || undefined,
          province_state: provinceState || undefined,
          postal_code: postalCode || undefined,
          website: website || null,
          facebook: facebook || null,
          instagram: instagram || null,
          twitter: twitter || null,
          prayer_times_url: prayerTimesUrl || null,
          ...(authData.user?.id ? { user_id: authData.user.id } : {}),
        }

      const { error } = await supabase
        .from('organization_applications')
        .insert(organizationData)

      if (error) throw error

      toast.success(
        'Account created! Your organization application is under review. Access will be limited until approved.',
        'Success',
      )
      navigation.navigate('SignIn')

      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setType('')
      setAddress('')
      setCity('')
      setCountry('')
      setPostalCode('')
      setProvinceState('')
      setContactName('')
      setContactPhone('')
      setWebsite('')
      setFacebook('')
      setInstagram('')
      setTwitter('')
      setPrayerTimesUrl('')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      toast.error(message, 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#2D3748" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Register Organization</Text>
          <Text style={styles.subtitle}>
            Create your account and register your masjid or Islamic organization
          </Text>

          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <Text style={styles.sectionTitle}>Organization Information</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="home"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Organization Name *"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="tag"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Organization Type (e.g., Masjid, Islamic Center) *"
              value={type}
              onChangeText={setType}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="map-pin"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="globe"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <Dropdown
              style={styles.dropdownInputBox}
              containerStyle={styles.dropdownMenuContainer}
              data={countryOptions}
              search
              maxHeight={250}
              labelField="label"
              valueField="value"
              placeholder="Select country"
              searchPlaceholder="Search country"
              value={countryCode}
              onChange={handleCountryChange}
              disable={false}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              iconStyle={styles.dropdownArrow}
              inputSearchStyle={styles.dropdownSearchInput}
            />
          </View>

          {stateOptions.length > 0 && (
            <View style={styles.inputContainer}>
              <Feather
                name="flag"
                size={20}
                color="#48BB78"
                style={styles.inputIcon}
              />
              <Dropdown
                style={styles.dropdownInputBox}
                containerStyle={styles.dropdownMenuContainer}
                data={stateOptions}
                search
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select province/state"
                searchPlaceholder="Search province/state"
                value={provinceStateCode}
                onChange={handleStateChange}
                disable={!countryCode}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                iconStyle={styles.dropdownArrow}
                inputSearchStyle={styles.dropdownSearchInput}
              />
            </View>
          )}

          {cityOptions.length > 0 && (
            <View style={styles.inputContainer}>
              <Feather
                name="map"
                size={20}
                color="#48BB78"
                style={styles.inputIcon}
              />
              <Dropdown
                style={styles.dropdownInputBox}
                containerStyle={styles.dropdownMenuContainer}
                data={cityOptions}
                search
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select city (optional)"
                searchPlaceholder="Search city"
                value={city}
                onChange={handleCityChange}
                disable={!provinceStateCode}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                iconStyle={styles.dropdownArrow}
                inputSearchStyle={styles.dropdownSearchInput}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Feather
              name="hash"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              autoCapitalize="characters"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Person Name *"
              value={contactName}
              onChangeText={setContactName}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="phone"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Phone"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <Text style={styles.sectionTitle}>Online Presence (Optional)</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="globe"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="link-2"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Facebook Page URL"
              value={facebook}
              onChangeText={setFacebook}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="link-2"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Instagram URL"
              value={instagram}
              onChangeText={setInstagram}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="link-2"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Twitter URL"
              value={twitter}
              onChangeText={setTwitter}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="clock"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Prayer Times URL"
              value={prayerTimesUrl}
              onChangeText={setPrayerTimesUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <Feather name="loader" size={20} color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register Organization</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchTextBold}> Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F7FAFC',
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#2D3748' },
  dropdownInputBox: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 40,
    justifyContent: 'center',
    height: 40,
  },
  dropdownMenuContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownArrow: {
    tintColor: '#A0AEC0',
    width: 22,
    height: 22,
    marginRight: 4,
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: '#2D3748',
    fontWeight: '500',
    fontSize: 16,
  },
  dropdownItemText: {
    color: '#2D3748',
    fontSize: 16,
    paddingVertical: 8,
  },
  dropdownSearchInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#48BB78',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  switchContainer: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#718096', fontSize: 16 },
  switchTextBold: { color: '#48BB78', fontWeight: '600' },
})
