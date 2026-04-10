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
// Removed useSafeAreaInsets as we are switching to standard spacing
import { supabase } from '../../Supabase/supabaseClient'
import AuthHeader from '../../components/Auth/AuthHeader'
import { toast } from '@/components/Toast/toast'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import type { User } from '@supabase/supabase-js'
import googleLogo from '../../../assets/google-logo.png'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function SignIn({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
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

  const ensureUserMetadata = async (
    user: User,
    isGoogle: boolean = false,
    isApple: boolean = false,
  ) => {
    let needsAuthUpdate = false
    const updateData: Record<string, string | null> = {}

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
    //
    if (isGoogle || isApple) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_org')
        .eq('id', user.id)
        .single()

      const isOrganizationUser =
        profile?.is_org === true ||
        user.user_metadata?.user_type === 'organization'

      if (isOrganizationUser) {
        if (user.user_metadata?.user_type !== 'organization') {
          needsAuthUpdate = true
          updateData.user_type = 'organization'
        }
      } else if (user.user_metadata?.user_type !== 'individual') {
        needsAuthUpdate = true
        updateData.user_type = 'individual'
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
          await ensureUserMetadata(data.user, true, false)
        }
      } else {
        throw new Error('No ID token present')
      }
    } catch (error: unknown) {
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

  const handleAppleSignIn = async () => {
    setLoading(true)
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        })

        if (error) throw error

        if (data.user) {
          await ensureUserMetadata(data.user, false, true)
        }
      } else {
        throw new Error('No identity token present')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (
          error.message ===
          "The operation couldn't be completed. (ASAuthorizationError error 1001.)"
        )
          return // User cancelled
        toast.error(error.message, 'Error')
      } else {
        toast.error('Apple Sign-In failed', 'Error')
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.topBounceFill,
          { backgroundColor: theme.colors.primary },
        ]}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader />

        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Sign in to continue
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Feather
              name="mail"
              size={20}
              color={theme.colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={theme.colors.textSoft}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Feather
              name="lock"
              size={20}
              color={theme.colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSoft}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              <Feather
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                { color: theme.colors.primary },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
            ]}
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
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <Text
              style={[styles.dividerText, { color: theme.colors.textSoft }]}
            >
              OR
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>

          {Platform.OS === 'ios' && (
            <View style={styles.appleButtonWrapper}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  theme.mode === 'dark'
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                    : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                }
                cornerRadius={10}
                style={styles.appleAuthButton}
                onPress={() => {
                  if (loading) return
                  void handleAppleSignIn()
                }}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              source={googleLogo}
              style={styles.googleIcon}
              fadeDuration={0}
            />
            <Text
              style={[styles.googleButtonText, { color: theme.colors.text }]}
            >
              Sign in with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => navigation.navigate('UserTypeSelection')}
          >
            <Text
              style={[styles.switchText, { color: theme.colors.textMuted }]}
            >
              Don't have an account?{' '}
              <Text
                style={[styles.switchTextBold, { color: theme.colors.primary }]}
              >
                {' '}
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollView: {
    flex: 1,
  },
  topBounceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  scrollContent: {
    flexGrow: 1,
    // Added static bottom padding for spacing instead of dynamic insets
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 24,
    marginTop: -1,
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
  appleButtonWrapper: {
    height: 55,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appleAuthButton: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
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
    fontSize: 20,
    fontWeight: '600',
  },
  switchContainer: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#718096', fontSize: 16 },
  switchTextBold: { color: '#48BB78', fontWeight: '600' },
})
