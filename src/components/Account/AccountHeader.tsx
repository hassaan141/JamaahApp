import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Profile } from '@/types'
//
export default function AccountHeader({
  profile,
  postCount,
  followerCount,
  isOrganization,
  handleOpenSettings,
}: {
  profile: Partial<Profile> | null
  postCount: number
  followerCount: number
  isOrganization: boolean
  handleOpenSettings: () => void
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#2F855A',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
          }}
        >
          <Feather name="user" size={32} color="#FFFFFF" />
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1D4732' }}>
              {profile?.first_name || 'User'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontSize: 14, color: '#1D4732', marginRight: 16 }}>
              <Text style={{ fontWeight: '600' }}>{postCount}</Text>
              <Text style={{ color: '#6C757D' }}> posts</Text>
            </Text>
            <Text style={{ fontSize: 14, color: '#1D4732' }}>
              <Text style={{ fontWeight: '600' }}>{followerCount}</Text>
              <Text style={{ color: '#6C757D' }}> followers</Text>
            </Text>
          </View>

          {isOrganization && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#E8F5E9',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                alignSelf: 'flex-start',
              }}
            >
              <Feather name="briefcase" size={12} color="#2F855A" />
              <Text
                style={{
                  fontSize: 12,
                  color: '#2F855A',
                  marginLeft: 4,
                  fontWeight: '500',
                }}
              >
                Organization
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleOpenSettings}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F8F9FA',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather name="settings" size={20} color="#1D4732" />
        </TouchableOpacity>
      </View>

      <View>
        {profile?.first_name && profile?.last_name && (
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: '#1D4732',
              marginBottom: 4,
            }}
          >
            {profile.first_name} {profile.last_name}
          </Text>
        )}

        {profile?.country && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Feather name="map-pin" size={13} color="#6C757D" />
            <Text style={{ fontSize: 13, color: '#6C757D', marginLeft: 4 }}>
              {profile.country}
            </Text>
          </View>
        )}

        <Text style={{ fontSize: 13, color: '#495057', lineHeight: 18 }}>
          Serving the Islamic community with announcements and events
        </Text>
      </View>
    </View>
  )
}
