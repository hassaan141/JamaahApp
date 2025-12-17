import { supabase } from './supabaseClient'
import { fetchOrgSubscribers } from './fetchOrgSubscribers'
import { fetchDevicesByProfileIds } from './fetchDevicesByProfileIds'

interface NotificationPayload {
  title: string
  body: string
  postId: string
  organizationId: string
  organizationName?: string
}

export async function sendPushToFollowers(payload: NotificationPayload) {
  try {
    console.log(
      `[sendPushToFollowers] Starting notification process for org: ${payload.organizationId}`,
    )

    // Step 1: Get ALL subscribers first (no joins)
    const allSubscribers = await fetchOrgSubscribers(payload.organizationId)

    if (!allSubscribers || allSubscribers.length === 0) {
      console.log('[sendPushToFollowers] No subscribers found')
      return { success: true, message: 'No subscribers to notify' }
    }

    // Step 2: Get device information for all profiles
    const profileIds = allSubscribers.map((sub) => sub.profile_id)
    const devices = await fetchDevicesByProfileIds(profileIds)

    // Step 3: Combine subscribers with their devices
    const subscribersWithData = allSubscribers.map((sub) => {
      const userDevices = devices.filter((d) => d.profile_id === sub.profile_id)

      return {
        ...sub,
        devices: userDevices,
      }
    })

    // Step 4: Filter for valid subscribers
    console.log(
      `[sendPushToFollowers] Filtering subscribers for valid notifications...`,
    )
    const validSubscribers = subscribersWithData.filter((sub) => {
      const hasPushEnabled = sub.push_enabled === true
      const hasDevices = sub.devices && sub.devices.length > 0
      const hasValidTokens = sub.devices?.some((d) => d.fcm_token) || false

      const isValid = hasPushEnabled && hasDevices && hasValidTokens

      if (!isValid) {
        console.log(
          `  ❌ Filtered out ${sub.profile_id}: Push=${hasPushEnabled}, Devices=${hasDevices}, Tokens=${hasValidTokens}`,
        )
      }

      return isValid
    })

    if (validSubscribers.length === 0) {
      console.log(
        '[sendPushToFollowers] No valid subscribers found after filtering',
      )
      return { success: true, message: 'No valid subscribers' }
    }

    // Step 5: Collect FCM tokens
    const fcmTokens: string[] = []
    validSubscribers.forEach((sub) => {
      sub.devices.forEach((device) => {
        if (device.fcm_token) {
          fcmTokens.push(device.fcm_token)
        }
      })
    })

    if (fcmTokens.length === 0) {
      console.log('[sendPushToFollowers] No FCM tokens found')
      return { success: true, message: 'No devices to notify' }
    }

    console.log(
      `[sendPushToFollowers] Sending to ${fcmTokens.length} devices from ${validSubscribers.length} subscribers`,
    )

    const { data, error: functionError } = await supabase.functions.invoke(
      'send-push-notification',
      {
        body: {
          tokens: fcmTokens,
          notification: {
            title: payload.organizationName
              ? `${payload.organizationName}: ${payload.title}`
              : payload.title,
            body: payload.body,
          },
          data: {
            postId: payload.postId,
            organizationId: payload.organizationId,
            type: 'org_post',
          },
        },
      },
    )

    if (functionError) {
      console.error('Error calling push function:', functionError)
      return { success: false, error: functionError.message }
    }

    return {
      success: true,
      message: `Notifications sent to ${fcmTokens.length} devices`,
      data,
    }
  } catch (error) {
    console.error('Error in sendPushToFollowers:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function notifyFollowersOfPost(
  postId: string,
  organizationId: string,
  title: string,
  body?: string,
) {
  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    return await sendPushToFollowers({
      postId,
      organizationId,
      title,
      body: body || 'New announcement available',
      organizationName: org?.name,
    })
  } catch (error) {
    console.error('Error notifying followers:', error)
    return { success: false, error: (error as Error).message }
  }
}
