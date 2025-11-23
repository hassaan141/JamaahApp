import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Dropdown } from 'react-native-element-dropdown'
import { Country, State, City } from 'country-state-city'

type Option = { label: string; value: string }

interface LocationData {
  address: string
  lat: number
  lng: number
  isCurrentAddress: boolean
}

interface LocationSelectorProps {
  orgAddress?: string
  orgLat?: number
  orgLng?: number
  onLocationChange: (location: LocationData) => void
}

const getLatLngFromAddress = async (
  address: string,
): Promise<{ lat: number; lng: number }> => {
  const apiKey = process.env.OPENROUTE_API
  if (!apiKey) throw new Error('OPENROUTE_API key not set in environment')

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`
  const response = await fetch(url)

  if (!response.ok) throw new Error(`Geocode API error: ${response.status}`)

  const data = await response.json()
  if (
    data &&
    data.features &&
    data.features.length > 0 &&
    data.features[0].geometry &&
    data.features[0].geometry.coordinates
  ) {
    const [lng, lat] = data.features[0].geometry.coordinates
    return { lat, lng }
  }

  throw new Error('No coordinates found for address')
}

export default function LocationSelector({
  orgAddress,
  orgLat,
  orgLng,
  onLocationChange,
}: LocationSelectorProps) {
  const [useCurrentAddress, setUseCurrentAddress] = useState(true)
  const [countryCode, setCountryCode] = useState('')
  const [country, setCountry] = useState('')
  const [provinceStateCode, setProvinceStateCode] = useState('')
  const [provinceState, setProvinceState] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  const countryOptions = useMemo<Option[]>(
    () =>
      Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.isoCode,
      })),
    [],
  )

  const stateOptions = useMemo<Option[]>(() => {
    if (!countryCode) return []
    return State.getStatesOfCountry(countryCode).map((s) => ({
      label: s.name,
      value: s.isoCode,
    }))
  }, [countryCode])

  const cityOptions = useMemo<Option[]>(() => {
    if (!countryCode || !provinceStateCode) return []
    return City.getCitiesOfState(countryCode, provinceStateCode).map((ct) => ({
      label: ct.name,
      value: ct.name,
    }))
  }, [countryCode, provinceStateCode])

  const handleLocationTypeChange = (useCurrent: boolean) => {
    setUseCurrentAddress(useCurrent)

    if (useCurrent && orgAddress && orgLat && orgLng) {
      onLocationChange({
        address: orgAddress,
        lat: orgLat,
        lng: orgLng,
        isCurrentAddress: true,
      })
    }
  }

  const handleCustomLocationChange = async () => {
    if (!country || !city) return

    const fullAddress = [city, provinceState, country]
      .filter(Boolean)
      .join(', ')

    try {
      setLoading(true)
      const { lat, lng } = await getLatLngFromAddress(fullAddress)

      onLocationChange({
        address: fullAddress,
        lat,
        lng,
        isCurrentAddress: false,
      })
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCountryChange = (item: Option) => {
    setCountryCode(item.value)
    setCountry(item.label)
    setProvinceState('')
    setProvinceStateCode('')
    setCity('')
  }

  const handleStateChange = (item: Option) => {
    setProvinceStateCode(item.value)
    setProvinceState(item.label)
    setCity('')
  }

  const handleCityChange = (item: Option) => {
    setCity(item.value)
    handleCustomLocationChange()
  }

  // Initialize with current address if available
  React.useEffect(() => {
    if (useCurrentAddress && orgAddress && orgLat && orgLng) {
      onLocationChange({
        address: orgAddress,
        lat: orgLat,
        lng: orgLng,
        isCurrentAddress: true,
      })
    }
  }, [useCurrentAddress, orgAddress, orgLat, orgLng, onLocationChange])

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
          <Text style={styles.radioText}>Use current address</Text>
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
              name="globe"
              size={20}
              color="#48BB78"
              style={styles.inputIcon}
            />
            <Dropdown
              style={styles.dropdownInputBox}
              containerStyle={styles.dropdownMenuContainer}
              data={countryOptions}
              search
              maxHeight={250}
              labelField="label"
              valueField="value"
              placeholder="Select country"
              searchPlaceholder="Search country"
              value={countryCode}
              onChange={handleCountryChange}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              iconStyle={styles.dropdownArrow}
              inputSearchStyle={styles.dropdownSearchInput}
            />
          </View>

          {stateOptions.length > 0 && (
            <View style={styles.inputContainer}>
              <Feather
                name="flag"
                size={20}
                color="#48BB78"
                style={styles.inputIcon}
              />
              <Dropdown
                style={styles.dropdownInputBox}
                containerStyle={styles.dropdownMenuContainer}
                data={stateOptions}
                search
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select province/state"
                searchPlaceholder="Search province/state"
                value={provinceStateCode}
                onChange={handleStateChange}
                disable={!countryCode}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                iconStyle={styles.dropdownArrow}
                inputSearchStyle={styles.dropdownSearchInput}
              />
            </View>
          )}

          {cityOptions.length > 0 && (
            <View style={styles.inputContainer}>
              <Feather
                name="map"
                size={20}
                color="#48BB78"
                style={styles.inputIcon}
              />
              <Dropdown
                style={styles.dropdownInputBox}
                containerStyle={styles.dropdownMenuContainer}
                data={cityOptions}
                search
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select city"
                searchPlaceholder="Search city"
                value={city}
                onChange={handleCityChange}
                disable={!provinceStateCode}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                iconStyle={styles.dropdownArrow}
                inputSearchStyle={styles.dropdownSearchInput}
              />
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <Feather name="loader" size={16} color="#48BB78" />
              <Text style={styles.loadingText}>Getting coordinates...</Text>
            </View>
          )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    color: '#2D3748',
  },
  currentAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  currentAddressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  dropdownInputBox: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 40,
    justifyContent: 'center',
    height: 40,
  },
  dropdownMenuContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownArrow: {
    tintColor: '#A0AEC0',
    width: 22,
    height: 22,
    marginRight: 4,
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: '#2D3748',
    fontWeight: '500',
    fontSize: 16,
  },
  dropdownItemText: {
    color: '#2D3748',
    fontSize: 16,
    paddingVertical: 8,
  },
  dropdownSearchInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#48BB78',
  },
})
