import { supabase } from './supabaseClient'

interface NotificationPayload {
  title: string
  body: string
  postId: string
  organizationId: string
  organizationName?: string
}

export async function sendPushToFollowers(payload: NotificationPayload) {
  try {
    const { data: subscribers, error } = await supabase
      .from('organization_subscriptions')
      .select(
        `
        profile_id,
        profiles!inner(
          devices(fcm_token, platform)
        )
      `,
      )
      .eq('organization_id', payload.organizationId)
      .eq('push_enabled', true)
      .eq('profiles.notification_preference', 'Event_Adhan')

    if (error) {
      console.error('Error fetching subscribers:', error)
      return { success: false, error: error.message }
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, message: 'No subscribers to notify' }
    }

    // Collect all FCM tokens
    const fcmTokens: string[] = []
    subscribers.forEach((subscriber) => {
      if (subscriber.profiles?.devices) {
        subscriber.profiles.devices.forEach(
          (device: { fcm_token?: string }) => {
            if (device.fcm_token) {
              fcmTokens.push(device.fcm_token)
            }
          },
        )
      }
    })

    if (fcmTokens.length === 0) {
      return { success: true, message: 'No devices to notify' }
    }

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
