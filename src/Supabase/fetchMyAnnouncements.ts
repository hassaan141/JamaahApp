import { supabase } from './supabaseClient'
import { getUserId } from '../Utils/getUserID'

export async function getMySubscribedOrgIds(): Promise<string[]> {
  const profileId = await getUserId()
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select('organization_id')
    .eq('profile_id', profileId)

  if (error) {
    console.error('[getMySubscribedOrgIds] Supabase error:', error)
    throw error
  }
  type Row = { organization_id: string | null }
  return ((data as Row[] | null) ?? [])
    .map((r) => r.organization_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
}

export type Announcement = {
  id: string
  organization_id: string
  author_profile_id: string | null
  title: string
  body: string | null
  created_at: string
  post_type: string | null
  demographic: string | null
  recurs_on_days: number[] | null
  start_time: string | null
  end_time: string | null
  date: string | null
  send_push: boolean
  organizations: {
    id: string
    name: string
    type: string | null
    city: string | null
    province_state: string | null
    country: string | null
  } | null
}

export async function fetchMyAnnouncements(
  opts: { limit?: number; cursor?: string | null } = {},
): Promise<Announcement[]> {
  const { limit = 30, cursor = null } = opts
  const orgIds = await getMySubscribedOrgIds()
  if (!orgIds.length) return []

  let q = supabase
    .from('org_posts')
    .select(
      `
      id,
      organization_id,
      author_profile_id,
      title,
      body,
      created_at,
      post_type,
      demographic,
      recurs_on_days,
      start_time,
      end_time,
      date,
      send_push,
      organizations!inner(
        id,
        name,
        type,
        city,
        province_state,
        country
      )
    `,
    )
    .in('organization_id', orgIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt('created_at', cursor)

  const { data, error } = await q
  if (error) {
    console.error('[fetchMyAnnouncements] Supabase error:', error)
    throw error
  }
  return (data as unknown as Announcement[]) ?? []
}
