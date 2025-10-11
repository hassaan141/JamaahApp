import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/core/env'
import type { Database } from '@/types'

export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
)
