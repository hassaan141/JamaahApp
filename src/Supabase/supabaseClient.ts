import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/core/env'
import type { Database } from '@/types'

// Minimal storage adapter that matches the storage interface expected by
// Supabase auth and forwards to AsyncStorage. Typed explicitly to avoid
// using `any` which ESLint flags.
const AsyncStorageAdapter: {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
} = {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key)
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value)
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key)
  },
}

export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorageAdapter,
    },
  },
)
