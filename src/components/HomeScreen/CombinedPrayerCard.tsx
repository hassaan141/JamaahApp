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
    time: string
    displayTime: string
  }>({ name: 'Loading...', type: 'Adhan', time: '', displayTime: '' })

  const [timeRemaining, setTimeRemaining] = useState('')

  const formatTime = (time?: string) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hours = parseInt(h, 10)
    if (isNaN(hours)) return ''
    const minutes = m
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHour = hours % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  // FIX: Added explicit return type here to satisfy TypeScript
  const determineNextEvent = (
    data: PrayerTimeRow | null,
  ): {
    name: string
    type: 'Adhan' | 'Iqamah'
    time: string
    displayTime: string
  } => {
    if (!data)
      return { name: 'Loading...', type: 'Adhan', time: '', displayTime: '' }

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

      // 1. Check Adhan
      if (p.adhan.substring(0, 5) > currentHHMM) {
        return {
          name: p.name,
          type: 'Adhan',
          time: p.adhan,
          displayTime: `${formatTime(p.adhan)} • Iqamah: ${formatTime(p.iqamah)}`,
        }
      }

      // 2. Check Iqamah (Only if valid string and differs from Adhan/Sunrise)
      if (
        p.iqamah &&
        p.iqamah.substring(0, 5) > currentHHMM &&
        p.name !== 'Sunrise'
      ) {
        return {
          name: p.name,
          type: 'Iqamah',
          time: p.iqamah,
          displayTime: `${formatTime(p.adhan)} • Iqamah: ${formatTime(p.iqamah)}`,
        }
      }
    }

    // If passed everything, show Tomorrow's Fajr Adhan
    return {
      name: 'Fajr',
      type: 'Adhan',
      time: data.tmrw_fajr_azan,
      displayTime: `${formatTime(data.tmrw_fajr_azan)} • Iqamah: ${formatTime(data.tmrw_fajr_iqamah)}`,
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

    // Calculate hours, minutes, AND seconds
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000) // <--- New Line

    // Update return strings to include seconds
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`
    return `${diffMinutes}m ${diffSeconds}s`
  }

  useEffect(() => {
    const update = () => {
      const next = determineNextEvent(prayerTimes)
      // This line previously failed because 'next' was loosely typed
      setNextEvent((prev) =>
        prev.time !== next.time || prev.type !== next.type ? next : prev,
      )
      setTimeRemaining(calculateTimeRemaining(next.time))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  if (!prayerTimes) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.infoBar}>
          <Text style={styles.infoBarText}>Select a masjid to view times</Text>
        </View>
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
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            Next: {nextEvent.name}{' '}
            {nextEvent.type === 'Iqamah' ? '(Iqamah)' : ''}
          </Text>
          <Feather
            name="chevron-right"
            size={24}
            color="#FFFFFF"
            style={{ opacity: 0.9 }}
          />
        </View>

        <View style={styles.infoBar}>
          <View style={styles.infoContent}>
            <Feather
              name="clock"
              size={16}
              color="#FFFFFF"
              style={styles.clockIcon}
            />
            <Text style={styles.infoBarText}>{nextEvent.displayTime}</Text>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>
              {nextEvent.type === 'Iqamah' ? 'Iqamah in' : 'Adhan in'}
            </Text>
            <Text style={styles.timerText}>{timeRemaining}</Text>
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
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 10,
  },
  clockIcon: {
    marginRight: 8,
    opacity: 0.9,
  },
  infoBarText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: -2,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  prayerGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  prayerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  adhanTime: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  iqamahTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
})

export default CombinedPrayerCard
