import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthHeader from '../../components/Auth/AuthHeader'
import type { RootStackParamList } from '@/Screens/Navigation/RootNavigator'
import { useTheme } from '@/theme'

const ONBOARDING_COMPLETE_KEY = '@jamaah_onboarding_complete'

export default function WelcomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()

  const handleSignIn = () => {
    navigation.navigate('SignIn')
  }

  const handleSignUp = () => {
    navigation.navigate('UserTypeSelection')
  }

  const handleContinueAsGuest = async () => {
    // Remember guest choice so we don't show WelcomeScreen again
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    } catch (e) {
      console.log('Error saving onboarding status:', e)
    }
    navigation.replace('Tabs')
  }

  return (
    <View
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
      >
        <AuthHeader />

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome to Jamaah
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Connect with your local Islamic community
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                },
              ]}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleContinueAsGuest}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.guestButtonText,
                  { color: theme.colors.textMuted },
                ]}
              >
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* <Text style={styles.guestNote}>
                        Guests can browse prayer times, masjids, and communities.{'\n'}
                        Sign up to follow organizations and get notifications.
                    </Text> */}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 24,
    marginTop: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#48BB78',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#48BB78',
  },
  secondaryButtonText: {
    color: '#48BB78',
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  guestButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  guestNote: {
    marginTop: 40,
    fontSize: 13,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
})
