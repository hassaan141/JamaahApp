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
import { useTheme } from '@/theme'

type PrayerTimeRow = Database['public']['Tables']['daily_prayer_times']['Row']

interface PrayerDetailModalProps {
  visible: boolean
  onClose: () => void
  prayerTimes: PrayerTimeRow | null
  orgName?: string
  currentDate: Date
  onNextDay: () => void
  onPrevDay: () => void
  canNextDay?: boolean
  canPrevDay?: boolean
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

// Updated Row to accept an Icon
const PrayerRow = ({
  name,
  azan,
  iqamah,
  singleTime,
  icon,
  theme,
}: {
  name: string
  azan?: string
  iqamah?: string
  singleTime?: string
  icon?: keyof typeof Feather.glyphMap
  theme: ReturnType<typeof useTheme>['theme']
}) => {
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.borderSoft }]}>
      <View style={styles.nameContainer}>
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={theme.colors.textSoft}
            style={styles.rowIcon}
          />
        )}
        <Text style={[styles.cellName, { color: theme.colors.text }]}>
          {name}
        </Text>
      </View>

      {singleTime ? (
        <View style={styles.singleTimeContainer}>
          <Text style={[styles.cellTimeSingle, { color: theme.colors.text }]}>
            {formatTime(singleTime)}
          </Text>
        </View>
      ) : (
        <View style={styles.timeContainer}>
          <View style={styles.timeColumn}>
            <Text style={[styles.cellTime, { color: theme.colors.textMuted }]}>
              {formatTime(azan)}
            </Text>
          </View>
          <View style={styles.timeColumn}>
            <Text
              style={[
                styles.cellTime,
                styles.iqamahTime,
                { color: theme.colors.primary },
              ]}
            >
              {formatTime(iqamah)}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const JummahRow = ({
  prayerTimes,
  theme,
}: {
  prayerTimes: PrayerTimeRow
  theme: ReturnType<typeof useTheme>['theme']
}) => {
  const jummahTimes = [
    { label: '1st', time: prayerTimes.jumah_time_1 },
    { label: '2nd', time: prayerTimes.jumah_time_2 },
    { label: '3rd', time: prayerTimes.jumah_time_3 },
  ].filter((j) => j.time)

  if (jummahTimes.length === 0) return null

  return (
    <View
      style={[
        styles.jummahContainer,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
        Jummah Prayers
      </Text>
      <View style={styles.jummahRow}>
        {jummahTimes.map((j, index) => (
          <View
            key={index}
            style={[
              styles.jummahBlock,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <Text
              style={[styles.jummahLabel, { color: theme.colors.textSoft }]}
            >
              {j.label}
            </Text>
            <Text style={[styles.jummahTime, { color: theme.colors.text }]}>
              {formatTime(j.time)}
            </Text>
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
  canNextDay = false,
  canPrevDay = false,
}) => {
  const { theme } = useTheme()
  if (!prayerTimes) return null

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
      <View
        style={[styles.centeredView, { backgroundColor: theme.colors.overlay }]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          )}
        </TouchableOpacity>

        <View
          style={[
            styles.modalView,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.orgName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {orgName || 'Masjid'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <Feather name="x" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Date Navigator */}
          <View
            style={[
              styles.dateNav,
              {
                backgroundColor: theme.colors.primarySoft,
                borderColor: theme.colors.primaryBorder,
              },
            ]}
          >
            <TouchableOpacity
              onPress={canPrevDay ? onPrevDay : undefined}
              style={[styles.navArrow, { opacity: canPrevDay ? 1 : 0 }]}
              disabled={!canPrevDay}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {formatDatePretty(currentDate)}
            </Text>

            <TouchableOpacity
              onPress={canNextDay ? onNextDay : undefined}
              style={[styles.navArrow, { opacity: canNextDay ? 1 : 0 }]}
              disabled={!canNextDay}
            >
              <Feather
                name="chevron-right"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Table Headers */}
          <View
            style={[
              styles.tableHeaderRow,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text
              style={[styles.headerCellName, { color: theme.colors.textSoft }]}
            >
              Prayer
            </Text>
            <View style={styles.timeContainer}>
              <Text
                style={[styles.headerCell, { color: theme.colors.textSoft }]}
              >
                Adhan
              </Text>
              <Text
                style={[styles.headerCell, { color: theme.colors.textSoft }]}
              >
                Iqamah
              </Text>
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
                theme={theme}
              />

              {/* Added Icon for Sunrise */}
              <PrayerRow
                name="Sunrise"
                singleTime={prayerTimes.sunrise}
                icon="sunrise"
                theme={theme}
              />

              {/* Added Icon for Zawal */}
              {prayerTimes.zawal ? (
                <PrayerRow
                  name="Zawal"
                  singleTime={prayerTimes.zawal}
                  icon="sun"
                  theme={theme}
                />
              ) : null}

              <PrayerRow
                name="Dhuhr"
                azan={prayerTimes.dhuhr_azan}
                iqamah={prayerTimes.dhuhr_iqamah}
                theme={theme}
              />
              <PrayerRow
                name="Asr"
                azan={prayerTimes.asr_azan}
                iqamah={prayerTimes.asr_iqamah}
                theme={theme}
              />
              <PrayerRow
                name="Maghrib"
                azan={prayerTimes.maghrib_azan}
                iqamah={prayerTimes.maghrib_iqamah}
                theme={theme}
              />
              <PrayerRow
                name="Isha"
                azan={prayerTimes.isha_azan}
                iqamah={prayerTimes.isha_iqamah}
                theme={theme}
              />
            </View>

            {/* JUMMAH SECTION */}
            {hasJummah && <JummahRow prayerTimes={prayerTimes} theme={theme} />}
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    borderWidth: 1,
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
    marginRight: 10,
  },
  closeButton: {
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  navArrow: {
    padding: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  headerCellName: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    flex: 1,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
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
  },
  singleTimeContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 35,
  },
  cellTimeSingle: {
    fontSize: 17,
    fontWeight: '500',
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
  },
  iqamahTime: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  jummahContainer: {
    marginTop: 10,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  jummahLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  jummahTime: {
    fontSize: 16,
    fontWeight: '700',
  },
})

export default PrayerDetailModal
