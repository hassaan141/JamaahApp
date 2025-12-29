import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
// Removed useSafeAreaInsets
import { supabase } from '../../Supabase/supabaseClient'
import { toast } from '@/components/Toast/toast'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'

// FIX 1: Use ES6 import instead of require()
import googleLogo from '../../../assets/google-logo.png'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function SignUp({ navigation }: { navigation: Nav }) {
  // Removed insets hook
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // Minimal profile data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email', 'profile'],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    })
  }, [])

  // 2. Google Sign-Up Handler
  // Note: signInWithIdToken acts as a Sign Up if the user doesn't exist.
  const handleGoogleSignUp = async () => {
    setLoading(true)
    console.log('[GoogleSignUp] Starting Google Sign-Up flow...') // LOG 1

    try {
      // 1. Check Play Services
      await GoogleSignin.hasPlayServices()
      console.log('[GoogleSignUp] Play Services available.') // LOG 2

      // 2. Perform Native Sign-In
      const userInfo = await GoogleSignin.signIn()
      console.log(
        '[GoogleSignUp] Google Native Success. UserInfo:',
        JSON.stringify(userInfo, null, 2),
      ) // LOG 3

      if (userInfo.data?.idToken) {
        console.log(
          '[GoogleSignUp] ID Token found. Authenticating with Supabase...',
        ) // LOG 4

        // 3. Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        })

        if (error) {
          console.error(
            '[GoogleSignUp] Supabase Auth Error:',
            JSON.stringify(error, null, 2),
          ) // LOG 5
          throw error
        }

        console.log(
          '[GoogleSignUp] Supabase Success! User ID:',
          data.session?.user?.id,
        ) // LOG 6
      } else {
        console.error('[GoogleSignUp] Critical: No ID Token in userInfo')
        throw new Error('No ID token present')
      }
    } catch (error: unknown) {
      // FIX 2: Use unknown instead of any
      // 4. Detailed Error Logging
      console.error('[GoogleSignUp] CATCH BLOCK TRIGGERED')
      console.error('[GoogleSignUp] Raw Error:', error)
      console.error(
        '[GoogleSignUp] JSON Error:',
        JSON.stringify(error, null, 2),
      )

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('[GoogleSignUp] User cancelled the flow.')
            break
          case statusCodes.IN_PROGRESS:
            console.log('[GoogleSignUp] Operation already in progress.')
            toast.error('Sign up is already in progress', 'Wait')
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.error('[GoogleSignUp] Play Services missing/outdated.')
            toast.error('Google Play Services not available', 'Error')
            break
          default:
            // This is where "DEVELOPER_ERROR" usually shows up
            console.error(`[GoogleSignUp] Unknown Status Code: ${error.code}`)
            toast.error(`Google Sign-Up failed: ${error.code}`, 'Error')
        }
      } else {
        const msg = error instanceof Error ? error.message : String(error)
        toast.error(msg || 'An unexpected error occurred', 'Error')
      }
    } finally {
      setLoading(false)
    }
  }

  // 3. Email Sign-Up Handler
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields', 'Error')
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

    setLoading(true)
    try {
      const displayName =
        firstName || lastName
          ? `${firstName || ''} ${lastName || ''}`.trim()
          : email.split('@')[0]

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.EXPO_PUBLIC_EMAIL_REDIRECT_TO,
          data: {
            user_type: 'individual', // Metadata for the SQL trigger
            first_name: firstName || '',
            last_name: lastName || '',
            display_name: displayName,
          },
        },
      })

      if (error) throw error

      if (authData?.session) {
        toast.success('Account created successfully!', 'Success')
      } else {
        toast.success(
          'Please check your email to verify your account',
          'Success',
        )
      }

      navigation.navigate('SignIn')

      // Reset form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFirstName('')
      setLastName('')
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <View
            style={[
              styles.inputContainer,
              confirmPassword &&
                password !== confirmPassword && { borderColor: '#E53E3E' },
            ]}
          >
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
              secureTextEntry={!confirmPasswordVisible}
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
            />
            <TouchableOpacity
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Feather
                name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color="#48BB78"
              />
            </TouchableOpacity>
          </View>

          {/* Password validation messages */}
          {confirmPassword && password !== confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
          {password && password.length < 6 && (
            <Text style={styles.errorText}>
              Password must be at least 6 characters
            </Text>
          )}

          {/* Sign Up Button */}
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

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <Image
              source={googleLogo} // FIX 1 Usage
              style={styles.googleIcon}
              fadeDuration={0}
            />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
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
    // Added static bottom padding to replace dynamic insets
    paddingBottom: 40,
  },
  headerContainer: {
    // Added static top padding to clear status bar since we removed insets
    paddingTop: 60,
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
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#2D3748' },
  eyeIcon: { padding: 10 },
  errorText: {
    fontSize: 13,
    color: '#E53E3E',
    marginBottom: 10,
    marginTop: -10,
    marginLeft: 5,
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
    marginTop: 15,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#A0AEC0',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 55,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
  googleButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#718096', fontSize: 16 },
  switchTextBold: { color: '#48BB78', fontWeight: '600' },
})
