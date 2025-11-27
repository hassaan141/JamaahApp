import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { Feather } from '@expo/vector-icons'

// Updated interface to explicitly allow nulls
interface LocationData {
  address: string
  lat?: number | null
  lng?: number | null
  isCurrentAddress?: boolean
}

interface LocationSelectorProps {
  orgAddress?: string
  orgLat?: number
  orgLng?: number
  onLocationChange: (location: LocationData) => void
  initialLocationData?: LocationData | null
}

export default function LocationSelector({
  orgAddress,
  orgLat,
  orgLng,
  onLocationChange,
  initialLocationData,
}: LocationSelectorProps) {
  // Determine initial state based on initial data
  const initialUseCurrentAddress = initialLocationData?.isCurrentAddress ?? true
  const initialCustomAddress =
    initialLocationData?.isCurrentAddress === false
      ? initialLocationData.address
      : ''

  console.log('[LocationSelector] Debug initial data:', {
    initialLocationData,
    initialUseCurrentAddress,
    initialCustomAddress,
    orgAddress,
  })

  const [useCurrentAddress, setUseCurrentAddress] = useState(
    initialUseCurrentAddress,
  )
  const [customAddress, setCustomAddress] = useState(initialCustomAddress)

  const handleLocationTypeChange = (useCurrent: boolean) => {
    setUseCurrentAddress(useCurrent)

    if (useCurrent && orgAddress) {
      // Switch to Org Address - Send actual coordinates
      onLocationChange({
        address: orgAddress,
        lat: orgLat,
        lng: orgLng,
        isCurrentAddress: true,
      })
    } else {
      // Switch to Custom Address - EXPLICITLY wipe coordinates
      onLocationChange({
        address: customAddress,
        lat: null,
        lng: null,
        isCurrentAddress: false,
      })
    }
  }

  // Handle text changes
  const handleTextChange = (text: string) => {
    setCustomAddress(text)
    // FIX: Update parent immediately and EXPLICITLY set lat/lng to null
    // This guarantees the parent knows coordinates are missing so it can fetch them.
    onLocationChange({
      address: text,
      lat: null,
      lng: null,
      isCurrentAddress: false,
    })
  }

  // Initialize with current address if available (only when no initial data is provided)
  React.useEffect(() => {
    if (!initialLocationData && useCurrentAddress && orgAddress) {
      onLocationChange({
        address: orgAddress,
        lat: orgLat,
        lng: orgLng,
        isCurrentAddress: true,
      })
    } else if (initialLocationData) {
      // If we have initial data, use it
      onLocationChange(initialLocationData)
    }
  }, [
    useCurrentAddress,
    orgAddress,
    orgLat,
    orgLng,
    onLocationChange,
    initialLocationData,
  ])

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Event Location</Text>

      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleLocationTypeChange(true)}
        >
          <View
            style={[styles.radio, useCurrentAddress && styles.radioSelected]}
          >
            {useCurrentAddress && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Current address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleLocationTypeChange(false)}
        >
          <View
            style={[styles.radio, !useCurrentAddress && styles.radioSelected]}
          >
            {!useCurrentAddress && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Custom address</Text>
        </TouchableOpacity>
      </View>

      {useCurrentAddress && orgAddress && (
        <View style={styles.currentAddressContainer}>
          <Feather name="map-pin" size={16} color="#48BB78" />
          <Text style={styles.currentAddressText}>{orgAddress}</Text>
        </View>
      )}

      {!useCurrentAddress && (
        <View>
          <View style={styles.inputContainer}>
            <Feather
              name="map-pin"
              size={18}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.customAddressInput}
              placeholder="123 main st, city, province, country"
              value={customAddress}
              onChangeText={handleTextChange}
              returnKeyType="done"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#48BB78',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48BB78',
  },
  radioText: {
    fontSize: 14,
    color: '#2D3748',
    flexShrink: 1,
  },
  currentAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentAddressText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#2D3748',
    flex: 1,
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  customAddressInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    paddingVertical: 6,
  },
})
