import React, { useState } from 'react'
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
import { supabase } from '../../Supabase/supabaseClient'
import AuthHeader from '../../components/Auth/AuthHeader'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function SignIn({ navigation }: { navigation: Nav }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const user = authData.user
      let needsUpdate = false
      const updateData: Record<string, string | null> = {}

      if (!user.user_metadata?.display_name) {
        needsUpdate = true

        if (user.user_metadata?.user_type === 'organization') {
          updateData.display_name =
            user.user_metadata?.organization_name || 'Organization User'
        } else {
          const firstName =
            (user.user_metadata?.first_name as string | undefined) || ''
          const lastName =
            (user.user_metadata?.last_name as string | undefined) || ''
          if (firstName || lastName) {
            updateData.display_name = `${firstName} ${lastName}`.trim()
          } else {
            updateData.display_name = user.email?.split('@')[0] || 'User'
          }
        }
      }

      if (!user.user_metadata?.user_type) {
        needsUpdate = true

        const emailForQuery = user.email ?? ''
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('contact_email', emailForQuery)
          .single()

        if (!orgError && orgData) {
          updateData.user_type = 'organization'
          const orgName =
            orgData && typeof orgData === 'object' && 'name' in orgData
              ? ((orgData as { name?: string }).name ?? undefined)
              : undefined
          if (orgName) {
            updateData.organization_name = orgName
            if (!updateData.display_name) {
              updateData.display_name = orgName
            }
          }
        } else {
          updateData.user_type = 'individual'
        }
      }

      if (needsUpdate) {
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

          <TouchableOpacity style={styles.forgotPassword}>
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F7FAFC',
  },
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
  switchContainer: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#718096', fontSize: 16 },
  switchTextBold: { color: '#48BB78', fontWeight: '600' },
})
