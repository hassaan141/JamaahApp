import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import ErrorBoundary from 'react-native-error-boundary'

import RootNavigator from './src/Screens/Navigation/RootNavigator'
import SignIn from './src/Screens/Auth/SignIn'
import SignUp from './src/Screens/Auth/SignUp'
import ForgotPassword from './src/Screens/Auth/ForgotPassword'
import OrganizationSignUp from './src/Screens/Auth/OrganizationSignUp'
import UserTypeSelection from './src/Screens/Auth/UserTypeSelection'

import { AuthProvider, useAuth } from './src/Auth/AuthProvider'
import { supabase } from './src/Supabase/supabaseClient'
import { ENV } from './src/core/env'
import ToastHost from './src/components/Toast/ToastHost'
import ForceUpdateScreen from './src/Screens/Navigation/ForceUpdateScreen'
import { checkForForcedUpdate } from './src/Utils/checkForForcedUpdate'

SplashScreen.preventAutoHideAsync().catch(() => {})

const Stack = createStackNavigator()

const TESTING_MODE = false
const TEST_EMAIL = String(ENV.TESTING?.email || '')
const TEST_PASSWORD = String(ENV.TESTING?.password || '')

const CustomFallback = (props: { error: Error; resetError: () => void }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorText}>
      The app encountered an unexpected error.
    </Text>
    <TouchableOpacity style={styles.resetButton} onPress={props.resetError}>
      <Text style={styles.resetButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
)

function AppNavigator() {
  const { session, setSession, loading } = useAuth()

  useEffect(() => {
    async function autoLogin() {
      if (__DEV__ && TESTING_MODE && !session && TEST_EMAIL && TEST_PASSWORD) {
        const { data } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        })
        if (data?.session) setSession(data.session)
      }
    }
    autoLogin()
  }, [session, setSession])

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync()
    }
  }, [loading])

  if (loading) {
    return null
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <Stack.Screen name="Root" component={RootNavigator} />
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignIn} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              <Stack.Screen
                name="UserTypeSelection"
                component={UserTypeSelection}
              />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen
                name="OrganizationSignUp"
                component={OrganizationSignUp}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}

export default function App() {
  const [checkingUpdate, setCheckingUpdate] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(false)

  useEffect(() => {
    let didTimeout = false
    const timeoutId = setTimeout(() => {
      didTimeout = true
      setCheckingUpdate(false)
    }, 3000)

    checkForForcedUpdate()
      .then((mustUpdate) => {
        if (!didTimeout) {
          clearTimeout(timeoutId)
          setForceUpdate(mustUpdate)
          setCheckingUpdate(false)
        }
      })
      .catch(() => {
        if (!didTimeout) {
          clearTimeout(timeoutId)
          setCheckingUpdate(false)
        }
      })

    return () => clearTimeout(timeoutId)
  }, [])

  if (checkingUpdate) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (forceUpdate) {
    return <ForceUpdateScreen />
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary FallbackComponent={CustomFallback}>
        <AuthProvider>
          <AppNavigator />
          <ToastHost />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  resetButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
})
