import { supabase } from './supabaseClient'

export type ApproveOrganizationParams = {
  applicationId: string
}

export type ApproveOrganizationResult = {
  ok: boolean
  error?: string
}

/**
 * Approves an organization application through a server-side RPC.
 * The RPC verifies the caller is an admin before changing organization/profile state.
 */
export async function approveOrganizationApplication(
  params: ApproveOrganizationParams,
): Promise<ApproveOrganizationResult> {
  const { applicationId } = params
  if (!applicationId) return { ok: false, error: 'applicationId is required' }

  try {
    const { error } = await supabase.rpc('approve_organization_application', {
      p_application_id: applicationId,
    })

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}
