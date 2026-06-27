import { supabase } from './supabaseClient'

export async function notifyFollowersOfPost(
  postId: string,
  organizationId: string,
) {
  try {
    console.log(
      `[notifyFollowersOfPost] Requesting push fanout for post ${postId} in org ${organizationId}`,
    )

    const { data, error: functionError } = await supabase.functions.invoke(
      'notify-followers-of-post',
      {
        body: {
          postId,
          organizationId,
        },
      },
    )

    if (functionError) {
      console.error('Error calling push fanout function:', functionError)
      return { success: false, error: functionError.message }
    }

    return {
      success: true,
      message: 'Notifications sent.',
      data,
    }
  } catch (error) {
    console.error('Error requesting push fanout:', error)
    return { success: false, error: (error as Error).message }
  }
}
