import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export interface PrayerTimes {
  fajr_azan: string
  fajr_iqamah: string
  sunrise: string
  dhuhr_azan: string
  dhuhr_iqamah: string
  asr_azan: string
  asr_iqamah: string
  maghrib_azan: string
  maghrib_iqamah: string
  isha_azan: string
  isha_iqamah: string
  tmrw_fajr_azan: string
  tmrw_fajr_iqamah: string
}

interface CombinedPrayerCardProps {
  prayerTimes: PrayerTimes | null
}

const CombinedPrayerCard: React.FC<CombinedPrayerCardProps> = ({
  prayerTimes,
}) => {
  const [nextPrayer, setNextPrayer] = useState<{
    name: string
    adhan: string
    iqaamah: string
  }>({ name: 'Loading...', adhan: '', iqaamah: '' })

  const [timeRemaining, setTimeRemaining] = useState('')

  // 1. Simple 24h -> 12h converter
  // Input: "13:30:00" -> Output: "1:30 PM"
  const formatTime = (time?: string) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    let hours = parseInt(h, 10)
    const minutes = m
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    hours = hours ? hours : 12 // Handle 0 as 12

    return `${hours}:${minutes} ${ampm}`
  }

  // 2. Determine Next Prayer by direct string comparison
  const determineNextPrayer = (data: PrayerTimes | null) => {
    if (!data) return { name: 'Loading...', adhan: '', iqaamah: '' }

    const now = new Date()
    // Get current time as "13:45" for easy comparison
    const currentHHMM = now.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })

    const schedule = [
      { name: 'Fajr', adhan: data.fajr_azan, iqaamah: data.fajr_iqamah },
      { name: 'Sunrise', adhan: data.sunrise, iqaamah: data.sunrise },
      { name: 'Dhuhr', adhan: data.dhuhr_azan, iqaamah: data.dhuhr_iqamah },
      { name: 'Asr', adhan: data.asr_azan, iqaamah: data.asr_iqamah },
      {
        name: 'Maghrib',
        adhan: data.maghrib_azan,
        iqaamah: data.maghrib_iqamah,
      },
      { name: 'Isha', adhan: data.isha_azan, iqaamah: data.isha_iqamah },
    ]

    // Find first prayer that is later than right now
    const next = schedule.find((p) => p.adhan.substring(0, 5) > currentHHMM)

    if (next) return next

    // If no match (late night), next is tomorrow's Fajr
    return {
      name: 'Fajr',
      adhan: data.tmrw_fajr_azan,
      iqaamah: data.tmrw_fajr_iqamah,
    }
  }

  // 3. Calculate countdown
  const calculateTimeRemaining = (targetTime: string) => {
    if (!targetTime) return ''

    const now = new Date()
    const targetDate = new Date()
    const [h, m] = targetTime.split(':')

    targetDate.setHours(parseInt(h), parseInt(m), 0, 0)

    // If target is earlier than now, it must be tomorrow (e.g. 1AM prayer vs 11PM now)
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1)
    }

    const diffMs = targetDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`
    return `${diffMinutes}m`
  }

  // Update loop
  useEffect(() => {
    const update = () => {
      if (prayerTimes) {
        const next = determineNextPrayer(prayerTimes)
        setNextPrayer(next)
        // Count down to the Iqamah of the next prayer
        setTimeRemaining(calculateTimeRemaining(next.iqaamah))
      }
    }

    update() // Run immediately
    const interval = setInterval(update, 1000) // Run every second

    return () => clearInterval(interval)
  }, [prayerTimes])

  return (
    <View style={styles.container}>
      <View style={styles.nextPrayerHeader}>
        <View style={styles.nextPrayerInfo}>
          <Feather name="clock" size={18} color="#FFFFFF" />
          <Text style={styles.nextPrayerText}>Next: {nextPrayer.name}</Text>
        </View>
        <Text style={styles.timeRemaining}>{timeRemaining}</Text>
      </View>

      <View style={styles.timesLine}>
        <Text style={styles.timesText}>
          {formatTime(nextPrayer.adhan)} • Iqamah:{' '}
          {formatTime(nextPrayer.iqaamah)}
        </Text>
      </View>

      {prayerTimes ? (
        <View style={styles.prayerGrid}>
          {/* Fajr */}
          <View style={styles.prayerColumn}>
            <Text style={styles.prayerName}>Fajr</Text>
            <Text style={styles.adhanTime}>
              {formatTime(prayerTimes.fajr_azan)}
            </Text>
            <Text style={styles.iqamahTime}>
              {formatTime(prayerTimes.fajr_iqamah)}
            </Text>
          </View>

          {/* Dhuhr */}
          <View style={styles.prayerColumn}>
            <Text style={styles.prayerName}>Dhuhr</Text>
            <Text style={styles.adhanTime}>
              {formatTime(prayerTimes.dhuhr_azan)}
            </Text>
            <Text style={styles.iqamahTime}>
              {formatTime(prayerTimes.dhuhr_iqamah)}
            </Text>
          </View>

          {/* Asr */}
          <View style={styles.prayerColumn}>
            <Text style={styles.prayerName}>Asr</Text>
            <Text style={styles.adhanTime}>
              {formatTime(prayerTimes.asr_azan)}
            </Text>
            <Text style={styles.iqamahTime}>
              {formatTime(prayerTimes.asr_iqamah)}
            </Text>
          </View>

          {/* Maghrib */}
          <View style={styles.prayerColumn}>
            <Text style={styles.prayerName}>Maghrib</Text>
            <Text style={styles.adhanTime}>
              {formatTime(prayerTimes.maghrib_azan)}
            </Text>
            <Text style={styles.iqamahTime}>
              {formatTime(prayerTimes.maghrib_iqamah)}
            </Text>
          </View>

          {/* Isha */}
          <View style={styles.prayerColumn}>
            <Text style={styles.prayerName}>Isha</Text>
            <Text style={styles.adhanTime}>
              {formatTime(prayerTimes.isha_azan)}
            </Text>
            <Text style={styles.iqamahTime}>
              {formatTime(prayerTimes.isha_iqamah)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
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
  },
  nextPrayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextPrayerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timesLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  timesText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  prayerGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  prayerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  adhanTime: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  iqamahTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
})

export default CombinedPrayerCard
