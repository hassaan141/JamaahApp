import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import ErrorBoundary from 'react-native-error-boundary'

import RootNavigator from './src/Screens/Navigation/RootNavigator'
// Auth screens are now in RootNavigator for guest mode navigation

import { AuthProvider, useAuth } from './src/Auth/AuthProvider'
import ToastHost from './src/components/Toast/ToastHost'
import ForceUpdateScreen from './src/Screens/Navigation/ForceUpdateScreen'
import { checkForForcedUpdate } from './src/Utils/checkForForcedUpdate'

SplashScreen.preventAutoHideAsync().catch(() => {})

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
  const { loading } = useAuth()

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync()
    }
  }, [loading])

  if (loading) {
    return null
  }

  // Guest mode: Always show main app - auth screens are in RootNavigator
  // Users can browse without signing in, auth is required for specific features
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <RootNavigator />
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
