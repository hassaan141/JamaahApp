import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'

export default function AnnouncementsSection({
  loadingAnnouncements,
  displayAnnouncements,
  styles,
}: {
  loadingAnnouncements: boolean
  displayAnnouncements: (OrgPost & { publishedAt?: string | null })[]
  styles: {
    sectionCard: object
    sectionHeader: object
    sectionIcon: object
    sectionTitle: object
    sectionSubtitle: object
    announcementCard: object
    announcementHeader: object
    announcementHeading: object
    smallIconButton: object
    announcementTitle: object
    announcementPublished: object
    announcementBody: object
  }
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Feather
          name="volume-2"
          size={20}
          color="#2F855A"
          style={styles.sectionIcon}
        />
        <View>
          <Text style={styles.sectionTitle}>Your Announcements</Text>
          <Text style={styles.sectionSubtitle}>
            Review what your community sees
          </Text>
        </View>
      </View>

      {loadingAnnouncements ? (
        <Text style={{ color: '#6C757D' }}>Loading...</Text>
      ) : displayAnnouncements.length === 0 ? (
        <Text
          style={{ color: '#6C757D', textAlign: 'center', paddingVertical: 20 }}
        >
          No announcements yet
        </Text>
      ) : (
        displayAnnouncements.map((item) => (
          <View key={item.id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementHeading}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                {item.publishedAt && (
                  <Text style={styles.announcementPublished}>
                    {item.publishedAt}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.smallIconButton}>
                <Feather name="edit-3" size={16} color="#2F855A" />
              </TouchableOpacity>
            </View>
            {!!item.body && (
              <Text style={styles.announcementBody}>{item.body}</Text>
            )}
          </View>
        ))
      )}
    </View>
  )
}
