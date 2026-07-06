import { Platform, Linking, Alert } from 'react-native'
import { toast } from '@/components/Toast/toast'

async function safeOpenURL(url: string, humanLabel = 'this link') {
  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      toast.error(`Your device can't open ${humanLabel}.`, 'Unable to open')
      return false
    }
    await Linking.openURL(url)
    return true
  } catch (err) {
    console.error('Linking error:', err)
    toast.error(`Something went wrong opening ${humanLabel}.`, 'Error')
    return false
  }
}

export async function openDirections({
  userLat,
  userLon,
  destLat,
  destLon,
  destAddress,
  placeLabel = '',
}: {
  userLat?: number | null
  userLon?: number | null
  destLat?: number | null
  destLon?: number | null
  destAddress?: string | null
  placeLabel?: string
}) {
  const hasOrigin = typeof userLat === 'number' && typeof userLon === 'number'
  const labelEncoded = encodeURIComponent(placeLabel || '')

  const destination = destAddress
    ? encodeURIComponent(destAddress)
    : `${destLat},${destLon}`

  const googleMapsURL = `https://www.google.com/maps/dir/?api=1${
    hasOrigin ? `&origin=${userLat},${userLon}` : ''
  }&destination=${destination}`

  if (Platform.OS === 'ios') {
    const saddr = hasOrigin ? `${userLat},${userLon}` : ''
    const daddr = destAddress
      ? encodeURIComponent(destAddress ?? '')
      : `${destLat},${destLon}`
    const appleMapsURL = hasOrigin
      ? `http://maps.apple.com/?saddr=${saddr}&daddr=${daddr}`
      : `http://maps.apple.com/?daddr=${daddr}`

    // Let iOS users pick their preferred maps app
    return new Promise<boolean>((resolve) => {
      Alert.alert('Get Directions', 'Choose your maps app', [
        {
          text: 'Apple Maps',
          onPress: () => resolve(safeOpenURL(appleMapsURL, 'Apple Maps')),
        },
        {
          text: 'Google Maps',
          onPress: () => resolve(safeOpenURL(googleMapsURL, 'Google Maps')),
        },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      ])
    })
  }

  const opened = await safeOpenURL(googleMapsURL, 'Google Maps')
  if (opened) return true

  const navURL = `google.navigation:q=${destLat},${destLon}`
  const openedNav = await safeOpenURL(navURL, 'Google Maps')
  if (openedNav) return true

  const geoURL = `geo:${destLat},${destLon}?q=${destLat},${destLon}${labelEncoded ? `(${labelEncoded})` : ''}`
  return safeOpenURL(geoURL, 'a maps app')
}

export async function openCall(rawPhone?: string | null) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    toast.error(
      "This organization hasn't added a phone number.",
      'No phone number',
    )
    return false
  }

  const normalized = rawPhone.replace(/[^\d+]/g, '')
  if (!normalized) {
    toast.error('The phone number provided is not valid.', 'Invalid phone')
    return false
  }

  const telURL = `tel:${normalized}`
  return safeOpenURL(telURL, 'the phone dialer')
}
