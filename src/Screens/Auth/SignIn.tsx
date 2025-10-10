import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { supabase } from '../../Supabase/supabaseClient'
import { useAuth } from '../../Auth/AuthProvider'

export default function SignIn() {
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) return Alert.alert('Sign in failed', error.message)
    if (data.session) setSession(data.session)
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>Sign In</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
        }}
      />
      <Button
        title={loading ? 'Signing in…' : 'Sign In'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  )
}
