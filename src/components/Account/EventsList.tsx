import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { Profile } from '@/types'
import { fetchMyAnnouncements } from '@/Supabase/fetchMyAnnouncements'

type EventItem = {
  id: string
  title: string
  meta?: string | null
  icon?: React.ComponentProps<typeof Feather>['name']
  description?: string | null
  body?: string | null
}

export default function EventsList({
  profile,
}: {
  profile: Partial<Profile> | null
}) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [shownCount, setShownCount] = useState(4)

  useEffect(() => {
    const loadEvents = async () => {
      if (!profile?.id) return

      setLoading(true)
      try {
        const data = await fetchMyAnnouncements()
        setEvents(data)
        setShownCount(Math.min(4, data.length))
      } catch (error) {
        console.error('[EventsList] Failed to load events', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [profile?.id])

  const PAGE_SIZE = 4
  const visibleEvents = events.slice(0, shownCount)
  const remaining = Math.max(0, events.length - shownCount)

  const styles = StyleSheet.create({
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      marginRight: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1D4732',
    },
    sectionSubtitle: {
      fontSize: 13,
      color: '#6C757D',
      marginTop: 2,
    },
    eventCard: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 14,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: '#2F855A',
    },
    eventHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1D4732',
      marginBottom: 2,
    },
    eventMeta: {
      fontSize: 13,
      color: '#6C757D',
    },
    eventDescription: {
      fontSize: 14,
      color: '#495057',
      lineHeight: 20,
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    loadingText: {
      color: '#6C757D',
      marginTop: 12,
      fontSize: 14,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F855A" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    )
  }

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Feather
          name="calendar"
          size={20}
          color="#2F855A"
          style={styles.sectionIcon}
        />
        <View>
          <Text style={styles.sectionTitle}>Your Events</Text>
          <Text style={styles.sectionSubtitle}>
            From your followed organizations
          </Text>
        </View>
      </View>

      {events.length === 0 ? (
        <Text
          style={{ color: '#6C757D', textAlign: 'center', paddingVertical: 20 }}
        >
          No events yet
        </Text>
      ) : (
        <>
          {visibleEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventIconWrapper}>
                  <Feather
                    name={event.icon || 'calendar'}
                    size={18}
                    color="#2F855A"
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.meta && (
                    <Text style={styles.eventMeta}>{event.meta}</Text>
                  )}
                </View>
              </View>
              {(event.description || event.body) && (
                <Text style={styles.eventDescription}>
                  {event.description || event.body}
                </Text>
              )}
            </View>
          ))}

          {remaining > 0 && (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 12,
                backgroundColor: '#F7FAFC',
                borderRadius: 8,
                marginTop: 4,
              }}
              onPress={() =>
                setShownCount((c) => Math.min(c + PAGE_SIZE, events.length))
              }
            >
              <Text
                style={{ fontSize: 14, color: '#48BB78', fontWeight: '500' }}
              >
                +{Math.min(PAGE_SIZE, remaining)} more events
              </Text>
            </TouchableOpacity>
          )}
          {shownCount > PAGE_SIZE && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                backgroundColor: '#F7FAFC',
                borderRadius: 8,
                marginTop: 6,
              }}
              onPress={() => setShownCount(PAGE_SIZE)}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#718096',
                  fontWeight: '500',
                  marginRight: 4,
                }}
              >
                Show less
              </Text>
              <Feather name="chevron-up" size={16} color="#718096" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  )
}
