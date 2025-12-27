import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// ✅ CORRECTED IMPORT PATH
import LoadingScreen from './src/Screens/Navigation/LoadingScreen'

import RootNavigator from './src/Screens/Navigation/RootNavigator'
import SignIn from './src/Screens/Auth/SignIn'
import SignUp from './src/Screens/Auth/SignUp'
import ForgotPassword from './src/Screens/Auth/ForgotPassword'
import OrganizationSignUp from './src/Screens/Auth/OrganizationSignUp'
import UserTypeSelection from './src/Screens/Auth/UserTypeSelection'

import { AuthProvider, useAuth } from './src/Auth/AuthProvider'
import ToastHost from './src/components/Toast/ToastHost'

const Stack = createStackNavigator()

function AppNavigator() {
  const { session, loading } = useAuth()

  // 1. If Auth is still loading, show your new Custom Screen
  if (loading) {
    return <LoadingScreen />
  }

  // 2. Otherwise, show the main app
  return (
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
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <ToastHost />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
