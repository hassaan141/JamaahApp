import Constants from 'expo-constants'
import semver from 'semver'
import { fetchMinSupportedVersion } from '@/Supabase/fetchAppConfig'

export async function checkForForcedUpdate(): Promise<boolean> {
  const currentVersion = Constants.expoConfig?.version

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

  // True = must force update
  return semver.lt(currentVersion, minSupportedVersion)
}
