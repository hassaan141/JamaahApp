import { supabase } from './supabaseClient'

export async function fetchDevicesByProfileIds(
  profileIds: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('profile_id, fcm_token, platform, last_seen_at')
    .in('profile_id', profileIds)

  if (error) {
    console.error('Error fetching devices:', error)
    throw new Error(error.message)
  }

  const devices = data || []
  console.log(
    `[fetchDevicesByProfileIds] Found ${devices.length} devices for ${profileIds.length} profiles`,
  )

  const devicesByProfile = devices
    .filter((device) => device.profile_id !== null)
    .reduce(
      (acc, device) => {
        if (!acc[device.profile_id!]) acc[device.profile_id!] = []
        acc[device.profile_id!].push(device)
        return acc
      },
      {} as Record<string, typeof devices>,
    )

  Object.entries(devicesByProfile).forEach(([profileId, userDevices]) => {
    console.log(`  Profile ${profileId}: ${userDevices.length} devices`)
    userDevices.forEach((device, index) => {
      console.log(
        `    Device ${index + 1}: ${device.platform} | Token: ${device.fcm_token ? device.fcm_token.substring(0, 15) + '...' : 'NO TOKEN'} | Last seen: ${device.last_seen_at}`,
      )
    })
  })

  const uniqueTokens = [
    ...new Set(
      devices
        .map((d) => d.fcm_token)
        .filter((token): token is string => token !== null && token !== ''),
    ),
  ]

  return uniqueTokens
}
