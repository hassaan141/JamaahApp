import { useMemo, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Dropdown } from 'react-native-element-dropdown'
import { Country } from 'country-state-city'
import { supabase } from '../../Supabase/supabaseClient'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function SignUp({ navigation }: { navigation: Nav }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')

  type CountryOption = { label: string; value: string }
  const countryOptions = useMemo<CountryOption[]>(() => {
    const list = Country.getAllCountries()
    return list.map((c) => ({ label: c.name, value: c.isoCode }))
  }, [])

  const handleCountryChange = (item: CountryOption) => {
    setCountryCode(item.value)
    setCountry(item.label)
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const displayName =
        firstName || lastName
          ? `${firstName || ''} ${lastName || ''}`.trim()
          : email.split('@')[0]

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'individual',
            first_name: firstName || null,
            last_name: lastName || null,
            phone: phone || null,
            country: country || null,
            display_name: displayName,
          },
        },
      })

      if (error) throw error

      Alert.alert('Success', 'Please check your email to verify your account', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') },
      ])

      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setCountry('')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      Alert.alert('Error', message)
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              <Feather
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={20}
                color="#48BB78"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <Feather name="loader" size={20} color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
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
  formContainer: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#2D3748' },
  eyeIcon: { padding: 10 },
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
    marginTop: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  switchContainer: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#718096', fontSize: 16 },
  switchTextBold: { color: '#48BB78', fontWeight: '600' },
})
