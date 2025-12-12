import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { DailyPrayerTimes } from '@/Utils/prayerTimes'

interface JummahCardProps {
  prayerTimes: DailyPrayerTimes | null
  org: { name?: string; timezone?: string | null } | null
}

export default function JummahCard({ prayerTimes, org }: JummahCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [futureJummahs, setFutureJummahs] = useState<string[]>([])

  useEffect(() => {
    if (!prayerTimes || !org) {
      setIsVisible(false)
      return
    }

    const checkJummahTime = () => {
      // 1. Check if today is Friday
      // We use the ORG's timezone to determine if it's Friday there
      const orgTimezone =
        org.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: orgTimezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      })

      const parts = formatter.formatToParts(now)
      const weekday = parts.find((p) => p.type === 'weekday')?.value

      if (weekday !== 'Friday') {
        setIsVisible(false)
        return
      }

      // 2. Get all Jummah times
      const jummahTimes = [
        prayerTimes.jumah_time_1,
        prayerTimes.jumah_time_2,
        prayerTimes.jumah_time_3,
      ].filter(Boolean) as string[] // e.g. ["13:30:00", "14:15:00"]

      if (jummahTimes.length === 0) {
        setIsVisible(false)
        return
      }

      // 3. Filter for future times
      // We need to convert "13:30:00" in orgTimezone to a timestamp
      // Strategy: Get today's date string in org timezone, append time, parse back

      const validFutureTimes: string[] = []

      jummahTimes.forEach((timeStr) => {
        // timeStr is "HH:MM:00"
        // Construct ISO string with offset? No, easier to use Date constructor with string
        // But Date.parse("2023-12-08T13:30:00") assumes local or UTC depending on browser

        // Robust way: Create a date object that represents that time in that timezone
        // We can't easily do this without a library like date-fns-tz or luxon in pure JS without hacks.
        // Hack: "2023-12-08T13:30:00" -> treat as UTC, then adjust by offset?

        // Better Hack:
        // 1. Create a date object for the target time assuming it's local
        // 2. Adjust it until its .toLocaleString(..., {timeZone: orgTimezone}) matches the target time

        // Actually, let's just compare "HH:MM" strings if we assume the date is today.
        // We already know "today" in org timezone is Friday.
        // So we just need the current time in org timezone as "HH:MM:SS"

        const currentTimeInOrg = new Intl.DateTimeFormat('en-GB', {
          // en-GB gives HH:MM:SS
          timeZone: orgTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now)

        // Simple string comparison works for 24h format: "13:30:00" > "12:00:00"
        if (timeStr > currentTimeInOrg) {
          validFutureTimes.push(timeStr)
        }
      })

      // 4. Logic: Show until 5 PM (17:00:00)
      // If it's past 5 PM in org timezone, hide everything
      const currentTimeInOrg = new Intl.DateTimeFormat('en-GB', {
        timeZone: orgTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now)

      if (currentTimeInOrg > '17:00:00') {
        setIsVisible(false)
        return
      }

      if (validFutureTimes.length > 0) {
        setFutureJummahs(validFutureTimes)
        setIsVisible(true)
      } else {
        // If no future jummahs but it's Friday and before 5pm,
        // maybe we still show the card but say "Jummah times passed"?
        // User requirement: "countdown until 5pm... and then the card is removed"
        // So if all jummahs passed but it's 3pm, do we show?
        // "only shows jummah... all three timings... until 5pm"
        // I'll assume we show all of them until 5pm, but maybe dim the passed ones?
        // Or just show the future ones? "countdown until 5pm" implies the card stays until 5pm.

        setFutureJummahs(jummahTimes) // Show all of them
        setIsVisible(true)
      }
    }

    checkJummahTime()
    // Update every minute
    const interval = setInterval(checkJummahTime, 60000)
    return () => clearInterval(interval)
  }, [prayerTimes, org])

  if (!isVisible) return null

  const formatTo12Hour = (time24: string) => {
    const [h, m] = time24.split(':')
    const hour = parseInt(h, 10)
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${suffix}`
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Feather name="sun" size={18} color="#D69E2E" />
        <Text style={styles.title}>Jummah Times</Text>
        <Text style={styles.orgName}>{org?.name}</Text>
      </View>

      <View style={styles.timesContainer}>
        {futureJummahs.map((time, index) => (
          <View key={index} style={styles.timeBadge}>
            <Text style={styles.timeText}>{formatTo12Hour(time)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#D69E2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 8,
    marginRight: 8,
  },
  orgName: {
    fontSize: 12,
    color: '#718096',
    flex: 1,
    textAlign: 'right',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBadge: {
    backgroundColor: '#FEFCBF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F6E05E',
  },
  timeText: {
    color: '#744210',
    fontWeight: '600',
    fontSize: 14,
  },
})
