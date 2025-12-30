import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import PrayerDetailModal from './PrayerDetailModal'
import type { Database } from '@/types/supabase'

type PrayerTimeRow = Database['public']['Tables']['daily_prayer_times']['Row']

interface CombinedPrayerCardProps {
  prayerTimes: PrayerTimeRow | null
  modalPrayerTimes?: PrayerTimeRow | null
  orgName?: string
  currentDate?: Date
  onNextDay?: () => void
  onPrevDay?: () => void
}

const CombinedPrayerCard: React.FC<CombinedPrayerCardProps> = ({
  prayerTimes,
  modalPrayerTimes,
  orgName,
  currentDate = new Date(),
  onNextDay = () => {},
  onPrevDay = () => {},
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const [nextEvent, setNextEvent] = useState<{
    name: string
    type: 'Adhan' | 'Iqamah'
    targetTime: string
    adhanTime: string
    iqamahTime: string
  }>({
    name: 'Loading...',
    type: 'Adhan',
    targetTime: '',
    adhanTime: '',
    iqamahTime: '',
  })

  const [timeRemaining, setTimeRemaining] = useState('')

  // UPDATED: Now includes AM/PM
  const formatTime = (time?: string) => {
    if (!time) return ''
    const [h, minutes] = time.split(':')
    const hours = parseInt(h, 10)
    if (isNaN(hours)) return ''
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHour = hours % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  const determineNextEvent = (data: PrayerTimeRow | null) => {
    if (!data)
      return {
        name: 'Loading...',
        type: 'Adhan' as const,
        targetTime: '',
        adhanTime: '',
        iqamahTime: '',
      }

    const now = new Date()
    const currentHHMM = now.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })

    const schedule = [
      { name: 'Fajr', adhan: data.fajr_azan, iqamah: data.fajr_iqamah },
      { name: 'Sunrise', adhan: data.sunrise, iqamah: data.sunrise },
      { name: 'Dhuhr', adhan: data.dhuhr_azan, iqamah: data.dhuhr_iqamah },
      { name: 'Asr', adhan: data.asr_azan, iqamah: data.asr_iqamah },
      {
        name: 'Maghrib',
        adhan: data.maghrib_azan,
        iqamah: data.maghrib_iqamah,
      },
      { name: 'Isha', adhan: data.isha_azan, iqamah: data.isha_iqamah },
    ]

    for (const p of schedule) {
      if (!p.adhan) continue

      if (p.adhan.substring(0, 5) > currentHHMM) {
        return {
          name: p.name,
          type: 'Adhan' as const,
          targetTime: p.adhan,
          adhanTime: p.adhan,
          iqamahTime: p.iqamah || '',
        }
      }

      if (
        p.iqamah &&
        p.iqamah.substring(0, 5) > currentHHMM &&
        p.name !== 'Sunrise'
      ) {
        return {
          name: p.name,
          type: 'Iqamah' as const,
          targetTime: p.iqamah,
          adhanTime: p.adhan,
          iqamahTime: p.iqamah,
        }
      }
    }

    return {
      name: 'Fajr',
      type: 'Adhan' as const,
      targetTime: data.tmrw_fajr_azan,
      adhanTime: data.tmrw_fajr_azan,
      iqamahTime: data.tmrw_fajr_iqamah || '',
    }
  }

  const calculateTimeRemaining = (targetTime: string) => {
    if (!targetTime) return ''
    const now = new Date()
    const targetDate = new Date()
    const [h, m] = targetTime.split(':')
    const hours = parseInt(h, 10)
    const minutes = parseInt(m, 10)
    if (isNaN(hours) || isNaN(minutes)) return ''

    targetDate.setHours(hours, minutes, 0, 0)

    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1)
    }

    const diffMs = targetDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(diffHours)}:${pad(diffMinutes)}:${pad(diffSeconds)}`
  }

  useEffect(() => {
    const update = () => {
      const next = determineNextEvent(prayerTimes)
      setNextEvent((prev) =>
        prev.targetTime !== next.targetTime || prev.type !== next.type
          ? next
          : prev,
      )
      setTimeRemaining(calculateTimeRemaining(next.targetTime))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  if (!prayerTimes) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.headerTitle}>Loading...</Text>
      </View>
    )
  }

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            {/* LEFT: Title */}
            <View>
              <Text style={styles.nextLabel}>NEXT PRAYER</Text>
              <Text style={styles.prayerTitle}>{nextEvent.name}</Text>
            </View>

            {/* RIGHT: Timer + Chevron */}
            <View style={styles.rightHeaderGroup}>
              <View style={styles.timerWrapper}>
                <Text style={styles.timerLabel}>
                  {nextEvent.type === 'Iqamah' ? 'IQAMAH IN' : 'ADHAN IN'}
                </Text>
                <Text style={styles.timerText}>{timeRemaining}</Text>
              </View>
              {/* Chevron moved here */}
              <Feather
                name="chevron-right"
                size={24}
                color="#FFFFFF"
                style={styles.headerChevron}
              />
            </View>
          </View>

          {/* Details Row: Adhan | Iqamah */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Feather
                name="volume-2"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              {/* Using formatTime to show AM/PM */}
              <Text style={styles.detailText}>
                Adhan: {formatTime(nextEvent.adhanTime)}
              </Text>
            </View>

            {nextEvent.name !== 'Sunrise' && (
              <>
                <View style={styles.verticalDivider} />
                <View style={styles.detailItem}>
                  <Feather
                    name="users"
                    size={14}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.detailText}>
                    Iqamah: {formatTime(nextEvent.iqamahTime)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.prayerGrid}>
          {[
            {
              label: 'Fajr',
              azan: prayerTimes.fajr_azan,
              iq: prayerTimes.fajr_iqamah,
            },
            {
              label: 'Dhuhr',
              azan: prayerTimes.dhuhr_azan,
              iq: prayerTimes.dhuhr_iqamah,
            },
            {
              label: 'Asr',
              azan: prayerTimes.asr_azan,
              iq: prayerTimes.asr_iqamah,
            },
            {
              label: 'Maghrib',
              azan: prayerTimes.maghrib_azan,
              iq: prayerTimes.maghrib_iqamah,
            },
            {
              label: 'Isha',
              azan: prayerTimes.isha_azan,
              iq: prayerTimes.isha_iqamah,
            },
          ].map((p, i) => (
            <View key={i} style={styles.prayerColumn}>
              <Text style={styles.prayerName}>{p.label}</Text>
              <Text style={styles.adhanTime}>{formatTime(p.azan)}</Text>
              <Text style={styles.iqamahTime}>{formatTime(p.iq)}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <PrayerDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        prayerTimes={modalPrayerTimes || prayerTimes}
        orgName={orgName}
        currentDate={currentDate}
        onNextDay={onNextDay}
        onPrevDay={onPrevDay}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#50b962ff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Aligns Title and Timer vertically
    marginBottom: 12,
  },
  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerChevron: {
    opacity: 0.8,
  },
  nextLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  prayerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  timerWrapper: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    // alignSelf: 'flex-start', // Keeps the box only as wide as content
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 12,
  },
  prayerGrid: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  prayerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  adhanTime: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  iqamahTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default CombinedPrayerCard
