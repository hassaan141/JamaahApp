import { supabase } from './supabaseClient'

export type ApproveOrganizationParams = {
  applicationId: string
  /**
   * Optional: pass the created organizations.id to link the profile.
   * If omitted, the profile will be marked as org but org_id will stay null until set later.
   */
  orgId?: string | null
}

export type ApproveOrganizationResult = {
  ok: boolean
  error?: string
}

/**
 * Approve an organization application and update the requester's profile.
 * - Sets organization_applications.application_status = 'approved'
 * - Updates the requester's profile: { is_org: true, org_id }
 *
 * Note: This assumes the caller has rights via RLS to update both tables.
 */
export async function approveOrganizationApplication(
  params: ApproveOrganizationParams,
): Promise<ApproveOrganizationResult> {
  const { applicationId, orgId = null } = params
  if (!applicationId) return { ok: false, error: 'applicationId is required' }

  try {
    // 1) Mark the application as approved and fetch its user_id
    const { data: app, error: appError } = await supabase
      .from('organization_applications')
      .update({
        application_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select('id, user_id')
      .maybeSingle()

    if (appError) return { ok: false, error: appError.message }
    if (!app?.user_id)
      return { ok: false, error: 'Missing user_id on application' }

    // 2) Update the requester profile with org privileges/link
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_org: true,
        org_id: orgId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.user_id)

    if (profileError) return { ok: false, error: profileError.message }

    return { ok: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}
