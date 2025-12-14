import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { Feather } from '@expo/vector-icons'

interface DateInputProps {
  date: string | null
  setDate: (d: string | null) => void
}

export default function DateInput({ date, setDate }: DateInputProps) {
  const [show, setShow] = useState(false)

  // Parse YYYY-MM-DD safely to local date
  const dateValue = React.useMemo(() => {
    if (!date) return new Date()
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [date])

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false)
    }

    if (event.type === 'set' || (Platform.OS === 'ios' && selectedDate)) {
      const currentDate = selectedDate || dateValue
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      setDate(`${year}-${month}-${day}`)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date</Text>

      <TouchableOpacity
        onPress={() => setShow((prev) => !prev)}
        style={styles.inputButton}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !date && styles.placeholder]}>
          {date || 'YYYY-MM-DD'}
        </Text>
        <Feather name="calendar" size={20} color="#6C757D" />
      </TouchableOpacity>

      {show && (
        <View
          style={Platform.OS === 'ios' ? styles.iosPickerContainer : undefined}
        >
          <DateTimePicker
            testID="dateTimePicker"
            value={dateValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            style={styles.datePicker}
            textColor="#000000"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.iosCloseButton}
              onPress={() => setShow(false)}
            >
              <Text style={styles.iosCloseText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 8,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholder: {
    color: '#999',
  },
  datePicker: {
    marginTop: 10,
    width: '100%',
    backgroundColor: 'white',
  },
  iosPickerContainer: {
    marginTop: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    overflow: 'hidden',
  },
  iosCloseButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
  },
  iosCloseText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
})
