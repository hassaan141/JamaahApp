import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function OurMission() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#1D4732" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Mission</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Feather name="heart" size={48} color="#2F855A" />
          </View>

          <Text style={styles.title}>Connecting the Ummah</Text>

          <Text style={styles.paragraph}>
            Jamaah is built with a simple yet powerful mission: to strengthen
            the connection between Muslims and their local communities.
          </Text>

          <Text style={styles.paragraph}>
            We believe that every Muslim deserves easy access to accurate prayer
            times, local events, and community announcements. Our app bridges
            the gap between masjids, Islamic organizations, and the people they
            serve.
          </Text>

          <Text style={styles.subTitle}>What We Stand For</Text>

          <View style={styles.valueItem}>
            <Feather name="users" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Community First</Text>
              <Text style={styles.valueDescription}>
                We prioritize the needs of local Islamic communities and work to
                make their voices heard.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Feather name="bell" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Adhan Notifications</Text>
              <Text style={styles.valueDescription}>
                Receive adhan notifications from the masjid closest to you, or
                pin your favorite masjid to always stay connected to their
                prayer times.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Feather name="rss" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Follow Organizations</Text>
              <Text style={styles.valueDescription}>
                Follow your favorite masjids and Islamic organizations to
                receive their announcements, events, and updates directly in
                your feed.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Feather name="clock" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Accurate Prayer Times</Text>
              <Text style={styles.valueDescription}>
                We provide precise prayer times based on your location, ensuring
                you never miss a prayer.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Feather name="globe" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Accessibility</Text>
              <Text style={styles.valueDescription}>
                Making Islamic community resources accessible to everyone,
                everywhere.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Feather name="shield" size={20} color="#2F855A" />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Privacy & Trust</Text>
              <Text style={styles.valueDescription}>
                Your data is sacred to us. We never sell or share your personal
                information.
              </Text>
            </View>
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
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4732',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4732',
    marginTop: 24,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 16,
  },
  valueItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  valueText: {
    flex: 1,
    marginLeft: 12,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
})
