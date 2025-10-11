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

interface NextPrayerCardProps {
  prayerTimes: PrayerTimes | null
}

const NextPrayerCard: React.FC<NextPrayerCardProps> = ({ prayerTimes }) => {
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

  return (
    <View style={styles.nextPrayerCard}>
      <View style={styles.leftSection}>
        <Feather name="clock" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.centerSection}>
        <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
        <View style={styles.timesRow}>
          <Text style={styles.prayerTime}>
            Adhan: {formatTime(nextPrayer.adhan, nextPrayer.name)}
          </Text>
          <Text style={styles.prayerTime}>
            Iqaamah: {formatTime(nextPrayer.iqaamah, nextPrayer.name)}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeRemaining}>{timeRemaining}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nextPrayerCard: {
    backgroundColor: '#50b962ff',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    marginLeft: 15,
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  nextPrayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})

export default NextPrayerCard
