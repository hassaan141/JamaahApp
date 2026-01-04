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
  color?: string
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
        >
          <Feather name="arrow-left" size={24} color="#1D4732" />
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
            >
              <View
                style={[
                  styles.iconContainer,
                  item.color && { backgroundColor: item.color },
                ]}
              >
                <Feather name={item.icon} size={20} color="#2F855A" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ADB5BD" />
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4732',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
})
