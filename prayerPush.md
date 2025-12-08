# Prayer Time Notification System (Client-Managed Pub/Sub)

## 1. Overview

This architecture moves the subscription logic **entirely to the mobile app**, eliminating the need for database schema changes while maintaining Pub/Sub efficiency.

### The Strategy

- **Backend (Broadcaster):** "Dumb" service that blindly checks `daily_prayer_times` every minute. If any mosque has a prayer at the current time, it broadcasts to that mosque's FCM topic (`org_123_prayers`). It doesn't track who's listening.
- **App (Listener):** "Smart" client that manages its own subscription. It determines the correct organization based on user mode (`pinned` vs `auto`) and subscribes/unsubscribes accordingly.

### Why Client-Managed?

✅ **Zero Database Migrations:** No new columns, no triggers, no schema changes.  
✅ **Scalable:** Backend sends 1 message per mosque, not 1 per user.  
✅ **Cost Effective:** Uses free FCM Topics; no extra database writes on location updates.  
✅ **Simple Backend:** Stateless broadcaster; all logic is in the app.

---

## 2. Core Components

### A. The Backend (The "Broadcaster")

A single Supabase Edge Function that runs every minute via cron.

**File:** `supabase/functions/broadcast-prayer-times/index.ts`

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

console.log('Prayer Broadcaster Service Started')

// 1. Setup Firebase Auth
async function getAccessToken(serviceAccount: any) {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })
  const token = await client.getAccessToken()
  return token.token
}

Deno.serve(async (req) => {
  try {
    // 2. Setup Supabase (Admin Client)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 3. Get Current Time (Format: HH:MM:00)
    const now = new Date()
    const currentTime = now.toISOString().split('T')[1].substring(0, 5) // e.g. "14:30"
    const today = now.toISOString().split('T')[0] // "2025-12-06"

    console.log(`Checking prayers for ${today} at ${currentTime}...`)

    // 4. Query: Which mosques have a prayer right now?
    const { data: prayers, error } = await supabase
      .from('daily_prayer_times')
      .select(
        'organization_id, fajr_azan, dhuhr_azan, asr_azan, maghrib_azan, isha_azan',
      )
      .eq('prayer_date', today)
      .or(
        `fajr_azan.eq.${currentTime}:00,dhuhr_azan.eq.${currentTime}:00,asr_azan.eq.${currentTime}:00,maghrib_azan.eq.${currentTime}:00,isha_azan.eq.${currentTime}:00`,
      )

    if (error) throw error
    if (!prayers || prayers.length === 0) {
      return new Response('No prayers scheduled for this minute.', {
        status: 200,
      })
    }

    // 5. Prepare Firebase Connection
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT')!)
    const accessToken = await getAccessToken(serviceAccount)
    const projectId = serviceAccount.project_id
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

    // 6. Broadcast Loop
    const results = []

    for (const row of prayers) {
      // Determine Prayer Name
      let prayerName = ''
      if (row.fajr_azan.startsWith(currentTime)) prayerName = 'Fajr'
      else if (row.dhuhr_azan.startsWith(currentTime)) prayerName = 'Dhuhr'
      else if (row.asr_azan.startsWith(currentTime)) prayerName = 'Asr'
      else if (row.maghrib_azan.startsWith(currentTime)) prayerName = 'Maghrib'
      else if (row.isha_azan.startsWith(currentTime)) prayerName = 'Isha'

      // Construct Topic: "org_{ID}_prayers"
      const topic = `org_${row.organization_id}_prayers`

      console.log(`Broadcasting ${prayerName} to topic: ${topic}`)

      const res = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            topic: topic,
            notification: {
              title: `${prayerName} Prayer`,
              body: `It is time for ${prayerName} at your local mosque.`,
            },
            data: {
              type: 'prayer_alert',
              prayer: prayerName,
              org_id: row.organization_id,
            },
          },
        }),
      })
      results.push(await res.json())
    }

    return new Response(
      JSON.stringify({ success: true, broadcasted_to: results.length }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
```

### B. The Frontend (The "Listener")

This logic manages topic subscription locally in the app.

**File:** `src/Utils/pushNotifications.ts` (add this function)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Ensures the device is subscribed to the ONE correct prayer topic.
 * Call this whenever:
 * 1. App opens (AuthProvider)
 * 2. User changes pinned mosque
 * 3. User switches between Auto/Pinned mode
 * 4. GPS detects a new nearest mosque (Auto mode)
 */
export async function syncPrayerSubscription(targetOrgId: string | null) {
  try {
    const currentSubscribedOrg = await AsyncStorage.getItem('prayer_sub_org_id')

    // OPTIMIZATION: If we are already subscribed to this org, do nothing.
    if (currentSubscribedOrg === targetOrgId) {
      console.log('[PrayerSub] Already subscribed to:', targetOrgId)
      return
    }

    console.log(
      `[PrayerSub] Switching subscription: ${currentSubscribedOrg} -> ${targetOrgId}`,
    )

    const module = await import('@react-native-firebase/messaging')
    const { getMessaging, unsubscribeFromTopic, subscribeToTopic } = module
    const messaging = getMessaging()

    // 1. Unsubscribe from the OLD topic (if any)
    if (currentSubscribedOrg) {
      const oldTopic = `org_${currentSubscribedOrg}_prayers`
      await unsubscribeFromTopic(messaging, oldTopic)
    }

    // 2. Subscribe to the NEW topic (if valid)
    if (targetOrgId) {
      const newTopic = `org_${targetOrgId}_prayers`
      await subscribeToTopic(messaging, newTopic)
      // Save state so we remember next time
      await AsyncStorage.setItem('prayer_sub_org_id', targetOrgId)
    } else {
      // User has no mosque selected (rare), just clear storage
      await AsyncStorage.removeItem('prayer_sub_org_id')
    }
  } catch (error) {
    console.error('[PrayerSub] Failed to sync topic:', error)
  }
}
```

### C. Database Tables (No Changes Required)

The system uses existing tables. See `src/types/supabase.ts` for exact definitions.

#### `profiles`

```typescript
Row: {
  id: string
  mode: string | null // 'auto' or 'pinned'
  pinned_org_id: string | null // User's manual choice
  // NO effective_org_id needed!
}
```

#### `last_location_state`

```typescript
Row: {
  user_id: string
  last_org_id: string | null // Nearest organization
  last_lat: number | null
  last_lon: number | null
}
```

#### `daily_prayer_times`

```typescript
Row: {
  organization_id: string
  prayer_date: string // "2025-12-06"
  fajr_azan: string // "05:30:00"
  dhuhr_azan: string
  asr_azan: string
  maghrib_azan: string
  isha_azan: string
}
```

---

## 3. Implementation Checklist

### Step 1: Deploy Backend

1. **Create the Edge Function:**

   ```bash
   mkdir -p supabase/functions/broadcast-prayer-times
   # Copy the code from Section 2.A into index.ts
   ```

2. **Deploy:**

   ```bash
   npx supabase functions deploy broadcast-prayer-times --no-verify-jwt
   ```

3. **Set Secrets:** Ensure `FIREBASE_SERVICE_ACCOUNT` is set in Supabase Dashboard → Settings → Secrets.

### Step 2: Setup Cron Job (The Heartbeat)

You need this function to run every minute automatically.

1. Go to **Supabase Dashboard → Database → Extensions → pg_cron**. Enable it if not already.
2. Run this SQL to create the cron job:
   ```sql
   SELECT cron.schedule(
     'prayer-broadcaster',
     '* * * * *',  -- Every minute
     $$
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT.supabase.co/functions/v1/broadcast-prayer-times',
       headers := jsonb_build_object('Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY')
     );
     $$
   );
   ```

### Step 3: Integrate Frontend Logic

Hook `syncPrayerSubscription()` into your app's lifecycle.

#### In `AuthProvider.tsx` (or wherever user profile loads):

```typescript
import { syncPrayerSubscription } from '@/Utils/pushNotifications'

// ... inside your useEffect or after fetching profile ...
useEffect(() => {
  if (profile) {
    // Determine target org based on mode
    const targetOrgId =
      profile.mode === 'pinned'
        ? profile.pinned_org_id
        : lastLocation?.last_org_id // Get from your location state

    syncPrayerSubscription(targetOrgId)
  }
}, [profile?.mode, profile?.pinned_org_id, lastLocation?.last_org_id])
```

#### In your "Pin Mosque" UI:

```typescript
const handlePin = async (orgId: string) => {
  await updateProfile({ pinned_org_id: orgId, mode: 'pinned' })
  // Immediate update (don't wait for useEffect)
  syncPrayerSubscription(orgId)
}
```

#### When GPS detects new nearest mosque:

```typescript
// After updating last_location_state
if (profile.mode === 'auto') {
  syncPrayerSubscription(newNearestOrgId)
}
```

---

## 4. Testing Plan

### Manual Test

1. Change a row in `daily_prayer_times` to be **2 minutes from now**.
2. Wait for the Cron to fire.
3. Check if your phone receives the notification.

### Logic Test

1. **Log in to the app.** Check logs: `[PrayerSub] Switching subscription: null -> org_A`.
2. **Change your pinned mosque.** Check logs: `[PrayerSub] Switching subscription: org_A -> org_B`.
3. **Wait 1 minute.** Ensure you don't see logs (Optimization check - no re-subscription if already subscribed).

### Integration Test with Firebase Console

1. Go to Firebase Console → Cloud Messaging → Send test message.
2. Select **Topic** and enter `org_123_prayers` (use your actual org ID).
3. Send the message. If your app is subscribed correctly, you'll receive it.

---

## 5. Key Files & Responsibilities

| File                                                     | Responsibility                                                                                    |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **`supabase/functions/broadcast-prayer-times/index.ts`** | **The Broadcaster.** Checks prayer times every minute and broadcasts to FCM topics.               |
| **`src/Utils/pushNotifications.ts`**                     | **Topic Subscription Manager.** Client-side logic for subscribing/unsubscribing to prayer topics. |
| **`src/Auth/AuthProvider.tsx`**                          | **Initial Sync.** Calls `syncPrayerSubscription()` on login and profile changes.                  |
| **Supabase pg_cron**                                     | **The Heartbeat.** Triggers the broadcaster function every minute.                                |

---

## 6. Cost & Scalability

| Component              | Cost       | Notes                                                        |
| :--------------------- | :--------- | :----------------------------------------------------------- |
| **FCM Topic Messages** | **$0.00**  | Unlimited and free.                                          |
| **Backend Cron**       | **~$0.00** | 1,440 executions/day fits in Supabase free tier.             |
| **Location Queries**   | **$0.00**  | Use PostGIS `ST_Distance` (free) instead of Google Maps API. |

**Estimated cost for 10,000 users:** $0-5/month (only Supabase database costs).

---

## 7. Troubleshooting

### Notifications not arriving

1. **Check topic subscription:**

   ```typescript
   const topic = await AsyncStorage.getItem('prayer_sub_org_id')
   console.log('Subscribed to:', topic)
   ```

2. **Check `daily_prayer_times`:** Does the organization have prayer times for today with the correct time format?

3. **Check Backend Logs:** Go to Supabase Dashboard → Edge Functions → Logs. Look for "Broadcasting" messages.

4. **Test with Firebase Console:** Send a test message to the topic manually to verify subscription.

### Wrong organization's prayers

- Verify the logic in `AuthProvider.tsx` is correctly determining `targetOrgId`.
- If in "Auto" mode, check `last_location_state.last_org_id` in the database.
- If in "Pinned" mode, check `profiles.pinned_org_id`.

### Subscription not switching

- Add more logging in `syncPrayerSubscription()`.
- Check if the function is being called when mode/location changes.
- Verify AsyncStorage is persisting correctly: `await AsyncStorage.getItem('prayer_sub_org_id')`.
