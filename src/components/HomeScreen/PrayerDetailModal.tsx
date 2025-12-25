import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { BlurView } from 'expo-blur'
import type { Database } from '@/types/supabase'

type PrayerTimeRow = Database['public']['Tables']['daily_prayer_times']['Row']

interface PrayerDetailModalProps {
  visible: boolean
  onClose: () => void
  prayerTimes: PrayerTimeRow | null
  orgName?: string
  currentDate: Date
  onNextDay: () => void
  onPrevDay: () => void
}

const formatTime = (timeString?: string | null) => {
  if (!timeString) return '-'
  const [h, m] = timeString.split(':')
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return timeString

  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${m} ${ampm}`
}

const formatDatePretty = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

// Updated Row to accept an Icon
const PrayerRow = ({
  name,
  azan,
  iqamah,
  singleTime,
  icon,
}: {
  name: string
  azan?: string
  iqamah?: string
  singleTime?: string
  icon?: keyof typeof Feather.glyphMap
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.nameContainer}>
        {icon && (
          <Feather
            name={icon}
            size={18}
            color="#9CA3AF"
            style={styles.rowIcon}
          />
        )}
        <Text style={styles.cellName}>{name}</Text>
      </View>

      {singleTime ? (
        <View style={styles.singleTimeContainer}>
          <Text style={styles.cellTimeSingle}>{formatTime(singleTime)}</Text>
        </View>
      ) : (
        <View style={styles.timeContainer}>
          <View style={styles.timeColumn}>
            <Text style={styles.cellTime}>{formatTime(azan)}</Text>
          </View>
          <View style={styles.timeColumn}>
            <Text style={[styles.cellTime, styles.iqamahTime]}>
              {formatTime(iqamah)}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const JummahRow = ({ prayerTimes }: { prayerTimes: PrayerTimeRow }) => {
  const jummahTimes = [
    { label: '1st', time: prayerTimes.jumah_time_1 },
    { label: '2nd', time: prayerTimes.jumah_time_2 },
    { label: '3rd', time: prayerTimes.jumah_time_3 },
  ].filter((j) => j.time)

  if (jummahTimes.length === 0) return null

  return (
    <View style={styles.jummahContainer}>
      <Text style={styles.sectionHeader}>Jummah Prayers</Text>
      <View style={styles.jummahRow}>
        {jummahTimes.map((j, index) => (
          <View key={index} style={styles.jummahBlock}>
            <Text style={styles.jummahLabel}>{j.label}</Text>
            <Text style={styles.jummahTime}>{formatTime(j.time)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const PrayerDetailModal: React.FC<PrayerDetailModalProps> = ({
  visible,
  onClose,
  prayerTimes,
  orgName,
  currentDate,
  onNextDay,
  onPrevDay,
}) => {
  if (!prayerTimes) return null

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = isSameDay(currentDate, today)
  const isTomorrow = isSameDay(currentDate, tomorrow)

  // Force check for Jummah existence
  const hasJummah = Boolean(
    prayerTimes.jumah_time_1 ||
      prayerTimes.jumah_time_2 ||
      prayerTimes.jumah_time_3,
  )

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          )}
        </TouchableOpacity>

        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName} numberOfLines={1}>
                {orgName || 'Masjid'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Date Navigator */}
          <View style={styles.dateNav}>
            <TouchableOpacity
              onPress={isToday ? undefined : onPrevDay}
              style={[styles.navArrow, { opacity: isToday ? 0 : 1 }]}
              disabled={isToday}
            >
              <Feather name="chevron-left" size={24} color="#50b962" />
            </TouchableOpacity>

            <Text style={styles.dateText}>{formatDatePretty(currentDate)}</Text>

            <TouchableOpacity
              onPress={isTomorrow ? undefined : onNextDay}
              style={[styles.navArrow, { opacity: isTomorrow ? 0 : 1 }]}
              disabled={isTomorrow}
            >
              <Feather name="chevron-right" size={24} color="#50b962" />
            </TouchableOpacity>
          </View>

          {/* Table Headers */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerCellName}>Prayer</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.headerCell}>Adhan</Text>
              <Text style={styles.headerCell}>Iqamah</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.tableBody}>
              <PrayerRow
                name="Fajr"
                azan={prayerTimes.fajr_azan}
                iqamah={prayerTimes.fajr_iqamah}
              />

              {/* Added Icon for Sunrise */}
              <PrayerRow
                name="Sunrise"
                singleTime={prayerTimes.sunrise}
                icon="sunrise"
              />

              {/* Added Icon for Zawal */}
              {prayerTimes.zawal ? (
                <PrayerRow
                  name="Zawal"
                  singleTime={prayerTimes.zawal}
                  icon="sun"
                />
              ) : null}

              <PrayerRow
                name="Dhuhr"
                azan={prayerTimes.dhuhr_azan}
                iqamah={prayerTimes.dhuhr_iqamah}
              />
              <PrayerRow
                name="Asr"
                azan={prayerTimes.asr_azan}
                iqamah={prayerTimes.asr_iqamah}
              />
              <PrayerRow
                name="Maghrib"
                azan={prayerTimes.maghrib_azan}
                iqamah={prayerTimes.maghrib_iqamah}
              />
              <PrayerRow
                name="Isha"
                azan={prayerTimes.isha_azan}
                iqamah={prayerTimes.isha_iqamah}
              />
            </View>

            {/* JUMMAH SECTION */}
            {hasJummah && <JummahRow prayerTimes={prayerTimes} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orgName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 6,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  navArrow: {
    padding: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  headerCellName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    flex: 1,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    width: 70,
    textAlign: 'center',
  },
  tableBody: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
  },
  cellName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  singleTimeContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 35,
  },
  cellTimeSingle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4B5563',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeColumn: {
    width: 70,
    alignItems: 'center',
  },
  cellTime: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4B5563',
  },
  iqamahTime: {
    fontWeight: '700',
    color: '#50b962',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  jummahContainer: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#50b962',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  jummahRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  jummahBlock: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jummahLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  jummahTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
})

export default PrayerDetailModal
