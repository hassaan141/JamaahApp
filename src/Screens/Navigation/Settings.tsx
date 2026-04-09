import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import SignOutButton from '@/components/Account/SignOutButton'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'

type SettingsItem = {
  title: string
  subtitle: string
  icon: React.ComponentProps<typeof Feather>['name']
  screen: string
  orgOnly?: boolean
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'Auto', icon: 'smartphone' },
] as const

const DISTANCE_OPTIONS = [
  { value: 'km', label: 'KM', icon: 'map-pin' },
  { value: 'mi', label: 'Miles', icon: 'navigation' },
] as const

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    title: 'Profile Settings',
    subtitle: 'Update your name and personal info',
    icon: 'user',
    screen: 'ProfileSettings',
  },
  {
    title: 'Account Settings',
    subtitle: 'Organization settings and account actions',
    icon: 'settings',
    screen: 'AccountSettings',
    orgOnly: true,
  },
  {
    title: 'Our Mission',
    subtitle: 'Learn about what we stand for',
    icon: 'heart',
    screen: 'OurMission',
  },
  {
    title: 'Help & Support',
    subtitle: 'FAQs and contact information',
    icon: 'help-circle',
    screen: 'HelpSupport',
  },
]

export default function Settings() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const { logout } = useAuth()
  const { profile } = useProfile()
  const { theme, mode, setMode } = useTheme()
  const { unit, setUnit } = useDistanceUnit()

  const isOrganization = profile?.is_org === true && !!profile?.org_id

  const filteredItems = useMemo(() => {
    return SETTINGS_ITEMS.filter((item) => !item.orgOnly || isOrganization)
  }, [isOrganization])

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen)
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.appearanceSection,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <Text style={[styles.appearanceTitle, { color: theme.colors.text }]}>
            Themes
          </Text>
          <Text
            style={[
              styles.appearanceSubtitle,
              { color: theme.colors.textMuted },
            ]}
          >
            Choose Light, Dark, or Auto (device setting).
          </Text>
          <View
            style={[
              styles.appearanceControl,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {THEME_OPTIONS.map((option) => {
              const selected = mode === option.value
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.appearanceOption,
                    {
                      backgroundColor: selected
                        ? theme.colors.surface
                        : 'transparent',
                      borderColor: selected
                        ? theme.colors.primaryBorder
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setMode(option.value)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={option.icon}
                    size={16}
                    color={
                      selected ? theme.colors.primary : theme.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.appearanceOptionText,
                      {
                        color: selected
                          ? theme.colors.primary
                          : theme.colors.textMuted,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View
          style={[
            styles.appearanceSection,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <Text style={[styles.appearanceTitle, { color: theme.colors.text }]}>
            Units
          </Text>
          <Text
            style={[
              styles.appearanceSubtitle,
              { color: theme.colors.textMuted },
            ]}
          >
            Default is kilometers. Switch to miles anytime.
          </Text>
          <View
            style={[
              styles.appearanceControl,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {DISTANCE_OPTIONS.map((option) => {
              const selected = unit === option.value
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.appearanceOption,
                    {
                      backgroundColor: selected
                        ? theme.colors.surface
                        : 'transparent',
                      borderColor: selected
                        ? theme.colors.primaryBorder
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setUnit(option.value)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={option.icon}
                    size={16}
                    color={
                      selected ? theme.colors.primary : theme.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.appearanceOptionText,
                      {
                        color: selected
                          ? theme.colors.primary
                          : theme.colors.textMuted,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          {filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.menuItem,
                index === filteredItems.length - 1 && styles.menuItemLast,
                { borderBottomColor: theme.colors.borderSoft },
              ]}
              onPress={() => handleNavigate(item.screen)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.primaryBorder,
                  },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.menuSubtitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
              <View style={styles.chevronWrap}>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.textSoft}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <SignOutButton onLogout={logout} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  modeButton: {
    marginLeft: 'auto',
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appearanceSection: {
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  appearanceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  appearanceSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  appearanceControl: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  appearanceOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  appearanceOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 18,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
