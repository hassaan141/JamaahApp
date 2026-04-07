import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native'
import { NavigationContainer, CommonActions } from '@react-navigation/native'
import type { NavigationContainerRef } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import ErrorBoundary from 'react-native-error-boundary'
import AsyncStorage from '@react-native-async-storage/async-storage'

import RootNavigator from './src/Screens/Navigation/RootNavigator'
import type { RootStackParamList } from './src/Screens/Navigation/RootNavigator'

import { AuthProvider, useAuth } from './src/Auth/AuthProvider'
import ToastHost from './src/components/Toast/ToastHost'
import ForceUpdateScreen from './src/Screens/Navigation/ForceUpdateScreen'
import { checkForForcedUpdate } from './src/Utils/checkForForcedUpdate'
import { ThemeProvider, useTheme } from './src/theme'
import { darkTheme } from './src/theme/dark'
import { lightTheme } from './src/theme/light'

const ONBOARDING_COMPLETE_KEY = '@jamaah_onboarding_complete'

SplashScreen.preventAutoHideAsync().catch(() => {})

const CustomFallback = (props: { error: Error; resetError: () => void }) => (
  <ThemedFallback {...props} />
)

function ThemedFallback(props: { error: Error; resetError: () => void }) {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.errorContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
        Something went wrong
      </Text>
      <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
        The app encountered an unexpected error.
      </Text>
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: theme.colors.primary }]}
        onPress={props.resetError}
      >
        <Text style={styles.resetButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  )
}

// Navigation ref for handling auth state changes
const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>()

function AppNavigator() {
  const { loading, session } = useAuth()
  const { theme } = useTheme()
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const prevSessionRef = useRef(session)

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
        setHasCompletedOnboarding(value === 'true')
      } catch (e) {
        console.log('Error checking onboarding status:', e)
      } finally {
        setOnboardingChecked(true)
      }
    }
    checkOnboarding()
  }, [])

  // Auto-navigate to Home when user signs in (from any auth screen)
  useEffect(() => {
    const wasSignedOut = !prevSessionRef.current
    const isNowSignedIn = !!session

    if (wasSignedOut && isNowSignedIn && navigationRef.current) {
      // User just signed in - navigate to Home and clear auth screens from stack
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs' }],
        }),
      )
      // Also mark onboarding as complete since they signed in
      AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true').catch(() => {})
    }

    prevSessionRef.current = session
  }, [session])

  const onLayoutRootView = useCallback(async () => {
    if (!loading && onboardingChecked) {
      await SplashScreen.hideAsync()
    }
  }, [loading, onboardingChecked])

  if (loading || !onboardingChecked) {
    return null
  }

  // Determine initial route:
  // - If signed in → Tabs
  // - If completed onboarding (chose guest) → Tabs
  // - First time user → Welcome
  const initialRoute = session || hasCompletedOnboarding ? 'Tabs' : 'Welcome'

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      onLayout={onLayoutRootView}
    >
      <NavigationContainer ref={navigationRef}>
        <RootNavigator initialRouteName={initialRoute} />
      </NavigationContainer>
    </View>
  )
}

export default function App() {
  const colorScheme = useColorScheme()
  const [checkingUpdate, setCheckingUpdate] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(false)
  const bootTheme = colorScheme === 'dark' ? darkTheme : lightTheme

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

  useEffect(() => {
    if (!checkingUpdate && forceUpdate) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [checkingUpdate, forceUpdate])

  if (checkingUpdate) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: bootTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={bootTheme.colors.primary} />
      </View>
    )
  }

  if (forceUpdate) {
    return <ForceUpdateScreen />
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary FallbackComponent={CustomFallback}>
          <AuthProvider>
            <AppNavigator />
            <ToastHost />
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
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
