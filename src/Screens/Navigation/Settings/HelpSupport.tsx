import React from 'react'
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function HelpSupport() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()

  const handleEmailSupport = () => {
    Linking.openURL('mailto:jamahcommunityapp@gmail.com')
  }

  const handleApplyOrganization = () => {
    Linking.openURL('https://jammah-dashboard.vercel.app/apply')
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
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="help-circle" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How do I find masjids near me?
            </Text>
            <Text style={styles.faqAnswer}>
              Go to the Map tab and enable location services. The app will
              automatically show nearby masjids and their prayer times.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How do I follow an organization?
            </Text>
            <Text style={styles.faqAnswer}>
              Navigate to the Communities tab, find the organization you want to
              follow, and tap the Follow button on their profile.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How do I enable prayer notifications?
            </Text>
            <Text style={styles.faqAnswer}>
              Make sure notifications are enabled in your device settings. Then
              follow the organizations you want to receive notifications from.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How do I register my organization?
            </Text>
            <Text style={styles.faqAnswer}>
              Visit our organization application portal to apply. Once approved,
              you'll be able to manage your masjid or organization through our
              dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="mail" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailSupport}
          >
            <View style={styles.contactIcon}>
              <Feather name="mail" size={20} color="#2F855A" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>
                jamahcommunityapp@gmail.com
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ADB5BD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleApplyOrganization}
          >
            <View style={styles.contactIcon}>
              <Feather name="briefcase" size={20} color="#2F855A" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Apply as Organization</Text>
              <Text style={styles.contactDescription}>
                Register your masjid or organization
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ADB5BD" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={20} color="#2F855A" />
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>3</Text>
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
    padding: 16,
    marginTop: 16,
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
    borderBottomColor: '#E9ECEF',
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
    borderBottomColor: '#E9ECEF',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
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
    borderBottomColor: '#E9ECEF',
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
