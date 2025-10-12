import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as OrgFollow from '@/Supabase/organizationFollow'

type Props = { community: Record<string, unknown> }

export default function CommunityItem({ community }: Props) {
  const navigation = useNavigation()
  const [following, setFollowing] = useState(
    !!(community.is_following as boolean | undefined),
  )
  const [loading, setLoading] = useState(false)

  const followFn = OrgFollow.followOrganization
  const unfollowFn = OrgFollow.unfollowOrganization

  const handleFollowToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (following) {
        setFollowing(false)
        await unfollowFn(String(community.id as string | number))
      } else {
        setFollowing(true)
        await followFn(String(community.id as string | number))
      }
    } catch (_err) {
      // Revert optimistic update on error
      setFollowing(following)
      console.error('follow/unfollow error', _err)
    } finally {
      setLoading(false)
    }
  }

  const address = [
    community.address,
    community.city,
    community.province_state,
    community.country,
  ]
    .filter(Boolean)
    .join(', ')

  const openWebsite = async (url?: string) => {
    try {
      if (!url) return
      const cleaned = url.startsWith('http') ? url : `https://${url}`
      const supported = await Linking.canOpenURL(cleaned)
      if (supported) await Linking.openURL(cleaned)
    } catch (err) {
      console.error('openWebsite error', err)
    }
  }
  const handlePress = () => {
    // @ts-expect-error navigation param typing
    navigation.navigate('OrganizationDetail', { org: community })
  }

  const name = String(community.name ?? '')
  const type = String(community.type ?? 'Organization')
  const description = String(community.description ?? 'No description provided')
  const contact_phone =
    typeof community.contact_phone === 'string'
      ? community.contact_phone
      : undefined
  const website =
    typeof community.website === 'string' ? community.website : undefined

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardType}>{type}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.followButton,
            following && styles.followingButton,
            loading && { opacity: 0.6 },
          ]}
          onPress={handleFollowToggle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#38A169" />
          ) : (
            <Text
              style={[
                styles.followButtonText,
                following && styles.followingButtonText,
              ]}
            >
              {following ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDescription}>{description}</Text>

      <View style={styles.infoRow}>
        <Feather
          name="map-pin"
          size={15}
          color="#38A169"
          style={styles.infoIcon}
        />
        <Text style={styles.infoText} numberOfLines={2}>
          {address || 'No address provided'}
        </Text>
      </View>

      {community.contact_phone ? (
        <View style={styles.infoRow}>
          <Feather
            name="phone"
            size={15}
            color="#38A169"
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{contact_phone}</Text>
        </View>
      ) : null}

      {website ? (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => openWebsite(website)}
        >
          <Feather
            name="globe"
            size={15}
            color="#38A169"
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, styles.linkText]} numberOfLines={1}>
            {website.replace(/^https?:\/\//, '')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E3F5E9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleBlock: { flex: 1 },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#1D4732',
    marginBottom: 2,
  },
  cardType: { fontSize: 13, color: '#38A169', marginBottom: 2 },
  cardDescription: { fontSize: 14, color: '#4A5568', marginBottom: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  infoIcon: { marginRight: 7 },
  infoText: { fontSize: 13, color: '#1D4732', flex: 1 },
  linkText: { color: '#4299E1', textDecorationLine: 'underline' },
  followButton: {
    backgroundColor: '#38A169',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  followingButton: {
    backgroundColor: '#E3F5E9',
    borderColor: '#38A169',
    borderWidth: 1,
  },
  followButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  followingButtonText: { color: '#38A169' },
})
