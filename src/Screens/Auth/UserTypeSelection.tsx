import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context' // Added import
import { useTheme } from '@/theme'

type Nav = { navigate: (route: string) => void; goBack: () => void }

export default function UserTypeSelection({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets() // Get safe area insets
  const { theme } = useTheme()

  const handleUserSelection = (userType: 'user' | 'organization') => {
    if (userType === 'user') {
      navigation.navigate('SignUp')
    } else {
      navigation.navigate('OrganizationSignUp')
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* FIX: Header top padding based on safe area */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 10,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          // FIX: Add dynamic bottom padding for navigation bar/home indicator
          {
            paddingBottom: 20 + insets.bottom,
            backgroundColor: theme.colors.background,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Join Our Community
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Choose how you want to sign up
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => handleUserSelection('user')}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Feather name="user" size={30} color={theme.colors.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
              Individual
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.textMuted },
              ]}
            >
              Join as a community member to find nearby masjids, view prayer
              times, and stay connected with your local Islamic community.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => handleUserSelection('organization')}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Feather name="home" size={30} color={theme.colors.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
              Organization
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.textMuted },
              ]}
            >
              Register your masjid or Islamic organization to manage your
              community, share programs, and connect with local Muslims.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={[styles.loginText, { color: theme.colors.textMuted }]}>
            Already have an account?
            <Text
              style={[styles.loginTextBold, { color: theme.colors.primary }]}
            >
              {' '}
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    // Removed fixed paddingTop: 50
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    // Removed fixed paddingBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 25,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 15,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 15,
  },
  loginContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: '#718096',
    fontSize: 16,
  },
  loginTextBold: {
    color: '#48BB78',
    fontWeight: '600',
  },
})
