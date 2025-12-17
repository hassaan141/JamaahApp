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
import { supabase } from '../../Supabase/supabaseClient'
import AuthHeader from '../../components/Auth/AuthHeader'
import { toast } from '@/components/Toast/toast'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'
import type { User } from '@supabase/supabase-js'

// FIX 1: Use ES6 import instead of require()
import googleLogo from '../../../assets/google-logo.png'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function SignIn({ navigation }: { navigation: Nav }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email', 'profile'],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    })
  }, [])

  // Helper to sync metadata
  const ensureUserMetadata = async (user: User, isGoogle: boolean = false) => {
    let needsAuthUpdate = false
    const updateData: Record<string, string | null> = {}

    // 1. Handle Display Name
    if (!user.user_metadata?.display_name) {
      needsAuthUpdate = true
      const fullName = user.user_metadata?.full_name
      const firstName = user.user_metadata?.first_name
      const lastName = user.user_metadata?.last_name

      if (fullName) {
        updateData.display_name = fullName
      } else if (firstName || lastName) {
        updateData.display_name = `${firstName || ''} ${lastName || ''}`.trim()
      } else {
        updateData.display_name = user.email?.split('@')[0] || 'User'
      }
    }

    // 2. Handle Organization Logic
    if (isGoogle) {
      if (user.user_metadata?.user_type !== 'individual') {
        needsAuthUpdate = true
        updateData.user_type = 'individual'
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_org')
        .eq('id', user.id)
        .single()

      if (profile?.is_org === true) {
        await supabase
          .from('profiles')
          .update({ is_org: false })
          .eq('id', user.id)
      }
    } else {
      if (!user.user_metadata?.user_type) {
        const emailForQuery = user.email ?? ''

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('contact_email', emailForQuery)
          .maybeSingle()

        if (!orgError && orgData) {
          needsAuthUpdate = true
          updateData.user_type = 'organization'
          updateData.organization_name = orgData.name

          if (!user.user_metadata?.display_name && !updateData.display_name) {
            updateData.display_name = orgData.name
          }

          await supabase
            .from('profiles')
            .update({ is_org: true })
            .eq('id', user.id)
        } else {
          needsAuthUpdate = true
          updateData.user_type = 'individual'
        }
      }
    }

    if (needsAuthUpdate) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updateData,
        },
      })
      if (updateError) {
        console.error('Error updating user metadata:', updateError)
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        })

        if (error) throw error

        if (data.user) {
          await ensureUserMetadata(data.user, true)
        }
      } else {
        throw new Error('No ID token present')
      }
    } catch (error: unknown) {
      // FIX 2: Use unknown instead of any
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break
          case statusCodes.IN_PROGRESS:
            toast.error('Sign in is already in progress', 'Wait')
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            toast.error('Google Play Services not available', 'Error')
            break
          default:
            toast.error('Google Sign-In failed', 'Error')
        }
      } else {
        const message =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred'
        toast.error(message, 'Error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password', 'Error')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (authData.user) {
        await ensureUserMetadata(authData.user, false)
      }
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
        <AuthHeader />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
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
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Feather name="loader" size={20} color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              source={googleLogo} // FIX 1 Usage
              style={styles.googleIcon}
              fadeDuration={0}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => navigation.navigate('UserTypeSelection')}
          >
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchTextBold}> Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { flexGrow: 1, backgroundColor: '#F7FAFC' },
  formContainer: { flex: 1, paddingHorizontal: 30, paddingTop: 40 },
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
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#48BB78', fontSize: 14, fontWeight: '500' },
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
