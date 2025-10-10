import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { supabase } from '../../Supabase/supabaseClient'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return Alert.alert('Sign up failed', error.message)
    Alert.alert('Check your email', 'We have sent you a confirmation link.')
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>Sign Up</Text>
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
        title={loading ? 'Signing up…' : 'Sign Up'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  )
}
