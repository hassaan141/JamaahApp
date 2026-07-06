import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

type NotifyRequest = {
  postId?: string
  organizationId?: string
}

type ServiceAccount = {
  client_email: string
  private_key: string
  project_id: string
}

type SendResult = {
  token: string
  success: boolean
  id?: string
  error?: string
  isInvalidToken?: boolean
}

type SubscriptionRow = {
  profile_id: string | null
}

type DeviceRow = {
  fcm_token: string | null
}

type FcmResponse = {
  name?: string
  error?: {
    message?: string
    details?: Array<{ errorCode?: string }>
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken(serviceAccount: ServiceAccount) {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  const token = await client.getAccessToken()
  return token.token
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')

    if (!supabaseUrl || !serviceRoleKey || !serviceAccountStr) {
      return jsonResponse(
        { success: false, error: 'Server configuration is incomplete' },
        500,
      )
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    if (!jwt) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt)

    if (userError || !user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    const payload = (await req.json()) as NotifyRequest
    const postId = payload.postId?.trim()
    const organizationId = payload.organizationId?.trim()

    if (!postId || !organizationId) {
      return jsonResponse(
        { success: false, error: 'postId and organizationId are required' },
        400,
      )
    }

    const isAdmin =
      user.app_metadata?.role === 'admin' ||
      user.app_metadata?.is_admin === true

    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('org_id, is_org')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw profileError

    const canSendForOrg =
      isAdmin ||
      (callerProfile?.is_org === true &&
        callerProfile?.org_id === organizationId)

    if (!canSendForOrg) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403)
    }

    const { data: post, error: postError } = await supabase
      .from('org_posts')
      .select('id, organization_id, title, body, organizations (name)')
      .eq('id', postId)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (postError) throw postError
    if (!post) {
      return jsonResponse({ success: false, error: 'Post not found' }, 404)
    }

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('organization_subscriptions')
      .select('profile_id')
      .eq('organization_id', organizationId)
      .eq('push_enabled', true)

    if (subscriptionsError) throw subscriptionsError

    const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[]
    const profileIds = [
      ...new Set(
        subscriptionRows
          .map((sub) => sub.profile_id)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          ),
      ),
    ]

    if (profileIds.length === 0) {
      return jsonResponse({
        success: true,
        message: 'No subscribers to notify',
        summary: { sent: 0, failed: 0 },
      })
    }

    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('fcm_token')
      .in('profile_id', profileIds)

    if (devicesError) throw devicesError

    const deviceRows = (devices ?? []) as DeviceRow[]
    const tokens = [
      ...new Set(
        deviceRows
          .map((device) => device.fcm_token)
          .filter(
            (token): token is string =>
              typeof token === 'string' && token.length > 0,
          ),
      ),
    ]

    if (tokens.length === 0) {
      return jsonResponse({
        success: true,
        message: 'No devices to notify',
        summary: { sent: 0, failed: 0 },
      })
    }

    const serviceAccount = JSON.parse(serviceAccountStr) as ServiceAccount
    const accessToken = await getAccessToken(serviceAccount)
    if (!accessToken) {
      throw new Error('Failed to generate FCM access token')
    }

    const organizationName = Array.isArray(post.organizations)
      ? post.organizations[0]?.name
      : post.organizations?.name
    const title = organizationName
      ? `${organizationName}: ${post.title}`
      : post.title
    const body = post.body || 'New announcement available'
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`

    const sentResults = await Promise.all(
      tokens.map(async (token): Promise<SendResult> => {
        try {
          const response = await fetch(fcmUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token,
                notification: { title, body },
                data: {
                  postId,
                  organizationId,
                  type: 'org_post',
                },
              },
            }),
          })

          const resData = (await response.json()) as FcmResponse
          if (response.ok) {
            return { token, success: true, id: resData.name }
          }

          const isInvalidToken =
            resData.error?.details?.[0]?.errorCode === 'UNREGISTERED'
          return {
            token,
            success: false,
            error: resData.error?.message ?? 'FCM send failed',
            isInvalidToken,
          }
        } catch (error) {
          return {
            token,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      }),
    )

    const invalidTokens = sentResults
      .filter((result) => result.isInvalidToken)
      .map((result) => result.token)

    if (invalidTokens.length > 0) {
      await supabase.from('devices').delete().in('fcm_token', invalidTokens)
    }

    const successCount = sentResults.filter((result) => result.success).length
    const failureCount = sentResults.length - successCount

    return jsonResponse({
      success: true,
      message: 'Notifications sent.',
      summary: { sent: successCount, failed: failureCount },
    })
  } catch (error) {
    console.error('[notify-followers-of-post] Fatal error:', error)
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500,
    )
  }
})
