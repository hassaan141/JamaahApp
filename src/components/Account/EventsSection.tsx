import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function EventsSection({
  loadingAnnouncements,
  displayEvents,
  styles,
}: {
  loadingAnnouncements: boolean
  displayEvents: Array<{
    id: string
    title: string
    meta?: string | null
    icon?: React.ComponentProps<typeof Feather>['name']
    description?: string | null
    body?: string | null
  }>
  styles: {
    sectionCard: object
    sectionHeader: object
    sectionIcon: object
    sectionTitle: object
    sectionSubtitle: object
    eventCard: object
    eventHeader: object
    eventIconWrapper: object
    eventInfo: object
    eventTitle: object
    eventMeta: object
    eventDescription: object
  }
}) {
  const PAGE_SIZE = 4
  const [shownCount, setShownCount] = React.useState(
    Math.min(PAGE_SIZE, displayEvents.length),
  )

  React.useEffect(() => {
    setShownCount(Math.min(PAGE_SIZE, displayEvents.length))
  }, [displayEvents])

  const visibleEvents = displayEvents.slice(0, shownCount)
  const remaining = Math.max(0, displayEvents.length - shownCount)

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

      {loadingAnnouncements ? (
        <Text style={{ color: '#6C757D' }}>Loading...</Text>
      ) : displayEvents.length === 0 ? (
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
                setShownCount((c) =>
                  Math.min(c + PAGE_SIZE, displayEvents.length),
                )
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
