import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatTime } from '@/Utils/datetime'

type Times = {
  fajr_azan: string
  sunrise: string
  dhuhr_azan: string
  asr_azan: string
  maghrib_azan: string
  isha_azan: string
  fajr_iqamah: string
  dhuhr_iqamah: string
  asr_iqamah: string
  maghrib_iqamah: string
  isha_iqamah: string
}

interface PrayerTimesTableProps {
  loading: boolean
  // Accept any object that at least has the Times fields we use
  prayerTimes: Partial<Times> | null
}

const PrayerTimesTable: React.FC<PrayerTimesTableProps> = ({
  loading,
  prayerTimes,
}) => {
  const PrayerCard = ({
    prayerName,
    adhanTime,
    iqaamahTime,
    prayerKey,
  }: {
    prayerName: string
    adhanTime?: string
    iqaamahTime?: string | null
    prayerKey: string
  }) => (
    <View style={styles.prayerCard}>
      <Text style={styles.prayerName}>{prayerName}</Text>
      <Text style={styles.adhanTime}>
        {formatTime(adhanTime ?? '', prayerKey)}
      </Text>
      {!!iqaamahTime && (
        <Text style={styles.iqaamahTime}>
          {formatTime(iqaamahTime, prayerKey)}
        </Text>
      )}
    </View>
  )

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Today's Prayer Times</Text>

      {!loading && prayerTimes ? (
        <View style={styles.prayerGrid}>
          <PrayerCard
            prayerName="Fajr"
            adhanTime={prayerTimes.fajr_azan as string}
            iqaamahTime={(prayerTimes.fajr_iqamah as string) ?? null}
            prayerKey="Fajr"
          />
          <PrayerCard
            prayerName="Sunrise"
            adhanTime={prayerTimes.sunrise as string}
            iqaamahTime={null}
            prayerKey="Sunrise"
          />
          <PrayerCard
            prayerName="Dhuhr"
            adhanTime={prayerTimes.dhuhr_azan as string}
            iqaamahTime={(prayerTimes.dhuhr_iqamah as string) ?? null}
            prayerKey="Dhuhr"
          />
          <PrayerCard
            prayerName="Asr"
            adhanTime={prayerTimes.asr_azan as string}
            iqaamahTime={(prayerTimes.asr_iqamah as string) ?? null}
            prayerKey="Asr"
          />
          <PrayerCard
            prayerName="Maghrib"
            adhanTime={prayerTimes.maghrib_azan as string}
            iqaamahTime={(prayerTimes.maghrib_iqamah as string) ?? null}
            prayerKey="Maghrib"
          />
          <PrayerCard
            prayerName="Isha"
            adhanTime={prayerTimes.isha_azan as string}
            iqaamahTime={(prayerTimes.isha_iqamah as string) ?? null}
            prayerKey="Isha"
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading
              ? 'Loading prayer times...'
              : 'No prayer times available for today.'}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  prayerCard: {
    width: '48%',
    backgroundColor: '#F7FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 2,
  },
  adhanTime: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '700',
    marginBottom: 1,
  },
  iqaamahTime: {
    fontSize: 10,
    color: '#718096',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A5568',
  },
})

export default PrayerTimesTable
export { PrayerTimesTable }
