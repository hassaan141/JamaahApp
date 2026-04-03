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
import { useProfile } from '@/Auth/fetchProfile'

type SettingsItem = {
  title: string
  subtitle: string
  icon: React.ComponentProps<typeof Feather>['name']
  screen: string
  orgOnly?: boolean
}

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
  const { profile } = useProfile()

  const isOrganization = profile?.is_org === true && !!profile?.org_id

  const filteredItems = useMemo(() => {
    return SETTINGS_ITEMS.filter((item) => !item.orgOnly || isOrganization)
  }, [isOrganization])

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          {filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.menuItem,
                index === filteredItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleNavigate(item.screen)}
              activeOpacity={0.75}
            >
              <View style={styles.iconContainer}>
                <Feather name={item.icon} size={18} color="#2F855A" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.chevronWrap}>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
