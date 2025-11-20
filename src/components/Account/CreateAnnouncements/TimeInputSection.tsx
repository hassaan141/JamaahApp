import React from 'react'
import { View } from 'react-native'
import TimeInput from './TimeInput'

interface TimeInputSectionProps {
  startTime: string | null
  setStartTime: (time: string | null) => void
  endTime: string | null
  setEndTime: (time: string | null) => void
  showStartPicker: boolean
  setShowStartPicker: (show: boolean) => void
  showEndPicker: boolean
  setShowEndPicker: (show: boolean) => void
}

export default function TimeInputSection({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  showStartPicker,
  setShowStartPicker,
  showEndPicker,
  setShowEndPicker,
}: TimeInputSectionProps) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <TimeInput
        label="Start Time"
        time={startTime}
        setTime={setStartTime}
        isOpen={showStartPicker}
        onToggle={() => {
          setShowStartPicker(!showStartPicker)
          setShowEndPicker(false)
        }}
      />

      <View style={{ width: 10 }} />

      <TimeInput
        label="End Time"
        time={endTime}
        setTime={setEndTime}
        isOpen={showEndPicker}
        onToggle={() => {
          setShowEndPicker(!showEndPicker)
          setShowStartPicker(false)
        }}
      />
    </View>
  )
}
