import { supabase } from './supabaseClient'

export async function notifyFollowersOfPost(
  postId: string,
  organizationId: string,
) {
  try {
    console.log(
      `[notifyFollowersOfPost] Requesting push fanout for post ${postId} in org ${organizationId}`,
    )

    // sendPostPush derives the org + subscribers from the post itself
    const { data, error: functionError } = await supabase.functions.invoke(
      'sendPostPush',
      {
        body: { post_id: postId },
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
