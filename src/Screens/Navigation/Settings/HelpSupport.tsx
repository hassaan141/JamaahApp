import React from 'react'
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/theme'

export default function HelpSupport() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const { theme } = useTheme()

  const handleEmailSupport = () => {
    Linking.openURL('mailto:jamahcommunityapp@gmail.com')
  }

  const handleApplyOrganization = () => {
    Linking.openURL('https://jammah-dashboard.vercel.app/apply')
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Help & Support
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={styles.sectionHeader}>
            <Feather
              name="help-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Frequently Asked Questions
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
              How do I find masjids near me?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.colors.textMuted }]}>
              Go to the Map tab and enable location services. The app will
              automatically show nearby masjids and their prayer times.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
              How do I follow an organization?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.colors.textMuted }]}>
              Navigate to the Communities tab, find the organization you want to
              follow, and tap the Follow button on their profile.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
              How do I enable prayer notifications?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.colors.textMuted }]}>
              Make sure notifications are enabled in your device settings. Then
              follow the organizations you want to receive notifications from.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
              How do I register my organization?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.colors.textMuted }]}>
              Visit our organization application portal to apply. Once approved,
              you'll be able to manage your masjid or organization through our
              dashboard.
            </Text>
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
          <View style={styles.sectionHeader}>
            <Feather name="mail" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Contact Us
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.contactItem,
              { borderBottomColor: theme.colors.borderSoft },
            ]}
            onPress={handleEmailSupport}
          >
            <View
              style={[
                styles.contactIcon,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.primaryBorder,
                },
              ]}
            >
              <Feather name="mail" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
                Email Support
              </Text>
              <Text
                style={[
                  styles.contactDescription,
                  { color: theme.colors.textMuted },
                ]}
              >
                jamahcommunityapp@gmail.com
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.textSoft}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleApplyOrganization}
          >
            <View
              style={[
                styles.contactIcon,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.primaryBorder,
                },
              ]}
            >
              <Feather
                name="briefcase"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
                Apply as Organization
              </Text>
              <Text
                style={[
                  styles.contactDescription,
                  { color: theme.colors.textMuted },
                ]}
              >
                Register your masjid or organization
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.textSoft}
            />
          </TouchableOpacity>
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
          <View style={styles.sectionHeader}>
            <Feather name="info" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              App Information
            </Text>
          </View>

          <View
            style={[
              styles.infoRow,
              { borderBottomColor: theme.colors.borderSoft },
            ]}
          >
            <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              1.0.0
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
              Build
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              3
            </Text>
          </View>
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
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
    marginLeft: 10,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4732',
  },
  contactDescription: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#495057',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D4732',
  },
})
