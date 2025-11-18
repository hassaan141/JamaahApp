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
  }>({ name: '', adhan: '', iqaamah: '' })
  const [timeRemaining, setTimeRemaining] = useState('')

  const formatTime = (time?: string, prayerName = '') => {
    if (!time) return ''
    const [timeStr] = time.split('.')
    const [hoursStr, minutesStr] = timeStr.split(':')
    const hours = Number.parseInt(hoursStr, 10)
    const minutes = Number.parseInt(minutesStr, 10)
    let period = 'AM'
    if (['Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayerName)) {
      period = 'PM'
    } else if (hours >= 12) {
      period = 'PM'
    }
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${formattedHours}:${formattedMinutes} ${period}`
  }

  const calculateTimeRemaining = (prayerTime?: string, prayerName?: string) => {
    if (!prayerTime) return ''
    const now = new Date()
    const [timeStr] = prayerTime.split('.')
    const [hoursStr, minutesStr] = timeStr.split(':')
    let hours = Number.parseInt(hoursStr, 10)
    const minutes = Number.parseInt(minutesStr, 10)
    if (['Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayerName || '')) {
      if (hours < 12 && hours !== 0) hours += 12
    }
    if (prayerName === 'Fajr' && hours === 12) {
      hours = 0
    }
    const prayerDate = new Date()
    prayerDate.setHours(hours, minutes, 0, 0)
    if (prayerDate <= now) {
      prayerDate.setDate(prayerDate.getDate() + 1)
    }
    const diffMs = prayerDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  }

  const determineNextPrayer = (
    prayerData: PrayerTimes | null,
  ): { name: string; adhan: string; iqaamah: string } => {
    if (!prayerData) return { name: 'Loading...', adhan: '', iqaamah: '' }
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTimeInMinutes = currentHours * 60 + currentMinutes
    const prayers = [
      {
        name: 'Fajr',
        adhan: prayerData.fajr_azan,
        iqaamah: prayerData.fajr_iqamah,
      },
      {
        name: 'Sunrise',
        adhan: prayerData.sunrise,
        iqaamah: prayerData.sunrise,
      },
      {
        name: 'Dhuhr',
        adhan: prayerData.dhuhr_azan,
        iqaamah: prayerData.dhuhr_iqamah,
      },
      {
        name: 'Asr',
        adhan: prayerData.asr_azan,
        iqaamah: prayerData.asr_iqamah,
      },
      {
        name: 'Maghrib',
        adhan: prayerData.maghrib_azan,
        iqaamah: prayerData.maghrib_iqamah,
      },
      {
        name: 'Isha',
        adhan: prayerData.isha_azan,
        iqaamah: prayerData.isha_iqamah,
      },
      {
        name: 'Tommorow Fajr',
        adhan: prayerData.tmrw_fajr_azan,
        iqaamah: prayerData.tmrw_fajr_iqamah,
      },
    ]
    const prayersWithMinutes = prayers.map((prayer) => {
      const [hoursStr, minutesStr] = prayer.adhan.split(':')
      let hours = Number.parseInt(hoursStr, 10)
      const minutes = Number.parseInt(minutesStr, 10)
      if (!['Fajr', 'Sunrise'].includes(prayer.name) && hours <= 12) {
        hours += 12
      }
      return {
        ...prayer,
        adhanMinutes: hours * 60 + minutes,
      }
    })
    const currentSeconds =
      currentHours * 3600 + currentMinutes * 60 + now.getSeconds()
    const isha = prayersWithMinutes.find((p) => p.name === 'Isha')
    const ishaSeconds = isha?.adhanMinutes ? isha.adhanMinutes * 60 : 0
    let nextPrayer = undefined
    if (currentSeconds > ishaSeconds && currentSeconds < 14400) {
      nextPrayer = prayersWithMinutes.find(
        (p) => p && p.name === 'Tommorow Fajr',
      )
    } else {
      nextPrayer = prayersWithMinutes.find(
        (p) => p.adhanMinutes > currentTimeInMinutes,
      )
    }
    if (!nextPrayer) return { name: 'Loading...', adhan: '', iqaamah: '' }
    return {
      name: nextPrayer.name,
      adhan: nextPrayer.adhan,
      iqaamah: nextPrayer.iqaamah,
    }
  }

  useEffect(() => {
    if (prayerTimes) {
      const next = determineNextPrayer(prayerTimes)
      setNextPrayer(next)
      setTimeRemaining(calculateTimeRemaining(next.iqaamah, next.name))
    }
  }, [prayerTimes])

  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes) {
        const next = determineNextPrayer(prayerTimes)
        setNextPrayer(next)
        setTimeRemaining(calculateTimeRemaining(next.iqaamah, next.name))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  const PrayerCard = ({
    prayerName,
    adhanTime,
    iqaamahTime,
  }: {
    prayerName: string
    adhanTime?: string
    iqaamahTime?: string | null
  }) => (
    <View style={styles.prayerCard}>
      <Text style={styles.prayerName}>{prayerName}</Text>
      <Text style={styles.adhanTime}>
        {formatTime(adhanTime ?? '', prayerName)}
      </Text>
      {!!iqaamahTime && (
        <Text style={styles.iqaamahTime}>
          {formatTime(iqaamahTime, prayerName)}
        </Text>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.nextPrayerSection}>
        <View style={styles.nextPrayerHeader}>
          <View style={styles.leftSection}>
            <Feather name="clock" size={20} color="#FFFFFF" />
            <Text style={styles.nextPrayerLabel}>Next: {nextPrayer.name}</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.timeRemaining}>{timeRemaining}</Text>
          </View>
        </View>
        <View style={styles.prayerTimesRow}>
          <Text style={styles.prayerTime}>
            Adhan: {formatTime(nextPrayer.adhan, nextPrayer.name)}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.prayerTime}>
            Iqaamah: {formatTime(nextPrayer.iqaamah, nextPrayer.name)}
          </Text>
        </View>
      </View>

      {prayerTimes ? (
        <View style={styles.prayerGrid}>
          <PrayerCard
            prayerName="Dhuhr"
            adhanTime={prayerTimes.dhuhr_azan}
            iqaamahTime={(prayerTimes.dhuhr_iqamah as string) ?? null}
          />
          <PrayerCard
            prayerName="Asr"
            adhanTime={prayerTimes.asr_azan}
            iqaamahTime={(prayerTimes.asr_iqamah as string) ?? null}
          />
          <PrayerCard
            prayerName="Maghrib"
            adhanTime={prayerTimes.maghrib_azan}
            iqaamahTime={(prayerTimes.maghrib_iqamah as string) ?? null}
          />
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
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextPrayerSection: {
    padding: 15,
  },
  nextPrayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nextPrayerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  rightSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeRemaining: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  prayerTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  prayerTime: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  prayerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  prayerCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  adhanTime: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  iqaamahTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
})

export default CombinedPrayerCard
