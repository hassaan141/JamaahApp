import Constants from 'expo-constants'
import { coerce, lt } from 'semver'
import { fetchMinSupportedVersion } from '@/Supabase/fetchAppConfig'

export async function checkForForcedUpdate(): Promise<boolean> {
  const currentVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? null

  // If we can't read the app version, never hard-block
  if (!currentVersion) {
    console.warn('[force-update] Missing app version')
    return false
  }

  const minSupportedVersion = await fetchMinSupportedVersion()

  // If backend fetch fails (offline, etc), do NOT block
  if (!minSupportedVersion) {
    console.warn('[force-update] Missing min_supported_version')
    return false
  }

  const parsedCurrentVersion = coerce(currentVersion)
  const parsedMinSupportedVersion = coerce(minSupportedVersion)

  if (!parsedCurrentVersion || !parsedMinSupportedVersion) {
    console.warn('[force-update] Invalid version format', {
      currentVersion,
      minSupportedVersion,
    })
    return false
  }

  // True = must force update when the installed app is below the minimum.
  return lt(parsedCurrentVersion, parsedMinSupportedVersion)
}
