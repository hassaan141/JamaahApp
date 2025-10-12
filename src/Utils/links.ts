import { Platform, Linking, Alert } from 'react-native'

async function safeOpenURL(url: string, humanLabel = 'this link') {
  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert('Unable to open', `Your device can't open ${humanLabel}.`)
      return false
    }
    await Linking.openURL(url)
    return true
  } catch (err) {
    console.error('Linking error:', err)
    Alert.alert('Error', `Something went wrong opening ${humanLabel}.`)
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

  if (Platform.OS === 'ios') {
    const saddr = hasOrigin ? `${userLat},${userLon}` : ''
    const daddr = destAddress
      ? encodeURIComponent(destAddress ?? '')
      : `${destLat},${destLon}`
    const url = hasOrigin
      ? `http://maps.apple.com/?saddr=${saddr}&daddr=${daddr}`
      : `http://maps.apple.com/?daddr=${daddr}`

    return safeOpenURL(url, 'Apple Maps')
  }

  const base = 'https://www.google.com/maps/dir/?api=1'
  const origin = hasOrigin ? `&origin=${userLat},${userLon}` : ''
  const dest = `&destination=${destination}`
  const fullURL = `${base}${origin}${dest}`

  const opened = await safeOpenURL(fullURL, 'Google Maps')
  if (opened) return true

  const navURL = `google.navigation:q=${destLat},${destLon}`
  const openedNav = await safeOpenURL(navURL, 'Google Maps')
  if (openedNav) return true

  const geoURL = `geo:${destLat},${destLon}?q=${destLat},${destLon}${labelEncoded ? `(${labelEncoded})` : ''}`
  return safeOpenURL(geoURL, 'a maps app')
}

export async function openCall(rawPhone?: string | null) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    Alert.alert(
      'No phone number',
      "This organization hasn't added a phone number.",
    )
    return false
  }

  const normalized = rawPhone.replace(/[^\\d+]/g, '')
  if (!normalized) {
    Alert.alert('Invalid phone', 'The phone number provided is not valid.')
    return false
  }

  const telURL = `tel:${normalized}`
  return safeOpenURL(telURL, 'the phone dialer')
}
