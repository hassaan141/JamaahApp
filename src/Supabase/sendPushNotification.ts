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

    const allSubscribers = await fetchOrgSubscribers(payload.organizationId)

    if (!allSubscribers || allSubscribers.length === 0) {
      console.log('[sendPushToFollowers] No subscribers found')
      return { success: true, message: 'No subscribers to notify' }
    }

    console.log(
      `[sendPushToFollowers] Filtering subscribers for valid notifications...`,
    )

    const validSubscribers = allSubscribers.filter((sub) => {
      const hasPushEnabled = sub.push_enabled === true

      if (!hasPushEnabled) {
        console.log(`  ❌ Filtered out ${sub.profile_id}: Push disabled`)
      }

      return hasPushEnabled
    })

    if (validSubscribers.length === 0) {
      console.log(
        '[sendPushToFollowers] No valid subscribers found after filtering',
      )
      return { success: true, message: 'No valid subscribers' }
    }

    const profileIds = validSubscribers.map((sub) => sub.profile_id)
    const fcmTokens = await fetchDevicesByProfileIds(profileIds)

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
