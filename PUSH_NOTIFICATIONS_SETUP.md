# Push Notifications Setup Guide

## Supabase Setup Required

### 1. Create Edge Function in Supabase Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Create new function named `send-push-notification`
3. Use the code provided below

### 2. Set Environment Variables

In your Supabase Dashboard → Settings → Secrets, add:

- `FIREBASE_SERVICE_ACCOUNT`: Your Firebase Service Account JSON (entire file content)

To get Firebase Service Account:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the ENTIRE JSON content and paste it as the secret value

## Firebase Setup Required

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project or use existing
3. Enable Cloud Messaging

### 2. Add Android App

1. Add Android app with your package name
2. Download `google-services.json`
3. Place in `android/app/` directory

### 3. Add iOS App

1. Add iOS app with your bundle ID
2. Download `GoogleService-Info.plist`
3. Place in `ios/` directory and add to Xcode project

### 4. React Native Configuration

#### Android (`android/app/build.gradle`)

```gradle
dependencies {
    // Add at bottom
    implementation 'com.google.firebase:firebase-messaging'
}
```

#### iOS (`ios/Podfile`)

```ruby
# Add this line
pod 'Firebase/Messaging', :modular_headers => true

# Then run
pod install
```

## How to Use in Your App

### 1. Follow an Organization

```typescript
import { followOrganization } from '@/Supabase/organizationFollow'

// Follow with push notifications enabled
await followOrganization(organizationId, true)
```

### 2. Send Notifications When Creating Posts

```typescript
import { notifyFollowersOfPost } from '@/Supabase/sendPushNotification'

// In your CreateAnnouncementSection component
const result = await createOrgAnnouncement(postData)
if (result.success && sendPushEnabled) {
  await notifyFollowersOfPost(
    result.data.id,
    organizationId,
    postTitle,
    postBody,
  )
}
```

### 3. Check Push Permission Status

```typescript
import { PushNotificationManager } from '@/Utils/pushNotifications'

const hasPermission =
  await PushNotificationManager.getInstance().checkPermission()
```

## Testing

### 1. Test Device Registration

```typescript
import { registerDeviceToken } from '@/Supabase/registerDevice'

const token = await registerDeviceToken('user-id')
console.log('Token:', token)
```

### 2. Test Following

```typescript
import {
  followOrganization,
  isFollowingOrganization,
} from '@/Supabase/organizationFollow'

await followOrganization('org-id')
const status = await isFollowingOrganization('org-id')
console.log('Following:', status)
```

### 3. Test Notification Sending

```typescript
import { notifyFollowersOfPost } from '@/Supabase/sendPushNotification'

const result = await notifyFollowersOfPost('post-id', 'org-id', 'Test Title')
console.log('Result:', result)
```

## Troubleshooting

### Common Issues

1. **"Firebase service account not configured"**
   - Make sure `FIREBASE_SERVICE_ACCOUNT` is set in Supabase secrets with the full JSON content
   - Verify the JSON is valid and contains `client_email`, `private_key`, and `project_id`
   - Redeploy the edge function after setting the secret

2. **"No tokens provided"**
   - Check if devices are properly registered
   - Verify users are following the organization with push enabled

3. **Notifications not received**
   - Check Firebase token is valid
   - Verify app is properly configured with Firebase
   - Test with Firebase Console first

### Debug Commands

```typescript
// Check if user is following with push enabled
const status = await isFollowingOrganization(orgId)
console.log('Following status:', status)

// Check device registration
const { data } = await supabase
  .from('devices')
  .select('*')
  .eq('profile_id', userId)
console.log('Registered devices:', data)

// Test edge function directly
const { data, error } = await supabase.functions.invoke(
  'send-push-notification',
  {
    body: {
      tokens: ['test-token'],
      notification: { title: 'Test', body: 'Test message' },
    },
  },
)
console.log('Function result:', data, error)
```

## Cost Estimates

- Firebase FCM: Free (up to 20B messages/month)
- Supabase Edge Functions: ~$2/1M invocations
- For 1000 users, 50 notifications/month: ~$0-5/month
- For 10,000 users, 200 notifications/month: ~$5-20/month

## Edge Function Code (For Supabase Dashboard)

Create an Edge Function called `send-push-notification` with this code:

```typescript
// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
// Import the Google Auth library directly from NPM
import { JWT } from 'npm:google-auth-library@9'

console.info('Push Notification V1 Service Started')

interface NotificationRequest {
  tokens: string[]
  notification: {
    title: string
    body: string
  }
  data?: Record<string, string>
}

// Helper function to get the Google Access Token
// This replaces the simple "Server Key" logic
async function getAccessToken(serviceAccount: any) {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  const token = await client.getAccessToken()
  return token.token
}

Deno.serve(async (req: Request) => {
  // Handle CORS (Optional but good practice if calling from web)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Get the Service Account from Secrets
    // You MUST paste the entire JSON file content into a secret named FIREBASE_SERVICE_ACCOUNT
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')

    if (!serviceAccountStr) {
      throw new Error(
        'Configuration Error: FIREBASE_SERVICE_ACCOUNT secret is missing',
      )
    }

    const serviceAccount = JSON.parse(serviceAccountStr)
    const projectId = serviceAccount.project_id

    // Get the Input Data
    const payload: NotificationRequest = await req.json()
    const { tokens, notification, data } = payload

    if (!tokens || tokens.length === 0) {
      throw new Error('No tokens provided')
    }

    // Generate the Security Token (The "V1" Requirement)
    console.log('Generating OAuth2 Access Token...')
    const accessToken = await getAccessToken(serviceAccount)

    if (!accessToken) {
      throw new Error('Failed to generate access token')
    }

    // Send the Notifications
    // V1 requires sending one by one, but HTTP/2 makes this fast.
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

    console.log(`Sending to ${tokens.length} devices...`)

    // Use Promise.all to send them in parallel (faster than a loop)
    const promises = tokens.map(async (token) => {
      try {
        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: token,
              notification: {
                title: notification.title,
                body: notification.body,
              },
              data: data || {}, // Optional extra data
            },
          }),
        })

        const resData = await response.json()

        if (response.ok) {
          return { token, success: true, id: resData.name }
        } else {
          // Identify invalid tokens so we can clean up our DB later
          const isInvalidToken =
            resData.error?.details?.[0]?.errorCode === 'UNREGISTERED'
          return {
            token,
            success: false,
            error: resData.error?.message,
            isInvalidToken,
          }
        }
      } catch (err) {
        return { token, success: false, error: err.message }
      }
    })

    // Wait for all requests to finish
    const sentResults = await Promise.all(promises)

    // Calculate summary
    const successCount = sentResults.filter((r) => r.success).length
    const failureCount = sentResults.filter((r) => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        summary: { sent: successCount, failed: failureCount },
        details: sentResults,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
        },
      },
    )
  } catch (error) {
    console.error('Fatal Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

## Next Steps

1. Test with real devices
2. Add notification analytics
3. Implement notification preferences per organization
4. Add scheduled notifications
5. Support rich notifications with images/actions
