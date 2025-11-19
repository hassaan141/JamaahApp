import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import RootNavigator from './src/Screens/Navigation/RootNavigator'
import SignIn from './src/Screens/Auth/SignIn'
import SignUp from './src/Screens/Auth/SignUp'
import OrganizationSignUp from './src/Screens/Auth/OrganizationSignUp'
import UserTypeSelection from './src/Screens/Auth/UserTypeSelection'
import { AuthProvider, useAuth } from './src/Auth/AuthProvider'
import { supabase } from './src/Supabase/supabaseClient'
import { ENV } from './src/core/env'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ToastHost from './src/components/Toast/ToastHost'

const Stack = createStackNavigator()

const TESTING_MODE = String(ENV.TESTING.enabled) === 'true'
const TEST_EMAIL = ENV.TESTING.email
const TEST_PASSWORD = ENV.TESTING.password

function AppNavigator() {
  const { session, setSession } = useAuth()

  useEffect(() => {
    console.log(
      'TESTING_MODE:',
      TESTING_MODE,
      'EMAIL:',
      TEST_EMAIL,
      'PASS:',
      TEST_PASSWORD,
      '__DEV__:',
      __DEV__,
    )
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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Root" component={RootNavigator} />
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
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
