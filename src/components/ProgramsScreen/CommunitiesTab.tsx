import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { searchOrganizations } from '@/Supabase/fetchOrganizations'
import type { Organization } from '@/types'
import CommunityItem from './CommunityItem'
import MasjidSearchBar from '@/components/MasjidScreen/MasjidSearchBar'

export default function CommunitiesTab() {
  const [loading, setLoading] = useState(false)
  const [communities, setCommunities] = useState<
    (Organization & { is_following?: boolean })[]
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const loadCommunities = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const data = await searchOrganizations({ query: q || '' })
      setCommunities(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('loadCommunities error', e)
      setCommunities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCommunities(debouncedQuery)
  }, [debouncedQuery, loadCommunities])

  if (loading && (!Array.isArray(communities) || communities.length === 0)) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#38A169" />
        <Text style={styles.loadingText}>Loading communities...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MasjidSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search communities"
        onSubmitEditing={() => loadCommunities(searchQuery)}
      />

      {!Array.isArray(communities) || communities.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No communities found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => loadCommunities(searchQuery)}
            />
          }
        >
          {communities.map((c) => {
            const id = String(c.id ?? '')
            return <CommunityItem key={id} community={c} />
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F4FBF6',
  },
  scrollContainer: { flex: 1 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F4FBF6',
  },
  loadingText: { marginTop: 12, color: '#1D4732', fontSize: 15 },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
})
