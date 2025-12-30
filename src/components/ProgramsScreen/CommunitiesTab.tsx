import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ActivityIndicator, // <--- Added this
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { searchOrganizations } from '@/Supabase/fetchOrganizations'
import type { Organization } from '@/types'
import CommunityItem from './CommunityItem'
import SearchBar from '@/components/SearchBar/SearchBar'
import LoadingAnimation from '@/components/Loading/Loading'

const FILTER_OPTIONS = [
  { label: 'Masjid', value: 'masjid' },
  { label: 'MSA', value: 'msa' },
  { label: 'Islamic School', value: 'islamic-school' },
  { label: 'Sisters Group', value: 'sisters-group' },
  { label: 'Youth Group', value: 'youth-group' },
  { label: 'Book Club', value: 'book-club' },
  { label: 'Book Store', value: 'book-store' },
  { label: 'Run Club', value: 'run-club' },
]

const FilterModal = ({
  visible,
  onClose,
  activeFilters,
  onToggle,
  onReset,
}: {
  visible: boolean
  onClose: () => void
  activeFilters: string[]
  onToggle: (val: string) => void
  onReset: () => void
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Communities</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#4A5568" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.filterList}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilters.includes(opt.value)
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterOption,
                  isActive && styles.filterOptionActive,
                ]}
                onPress={() => onToggle(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {isActive && <Feather name="check" size={18} color="#FFF" />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.applyButtonText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)

export default function CommunitiesTab() {
  // 1. New State to track if it is the very first load
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [communities, setCommunities] = useState<
    (Organization & { is_following?: boolean })[]
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [filterVisible, setFilterVisible] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

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
      // 2. Once the first request finishes, we turn off the big animation forever
      setIsFirstLoad(false)
    }
  }, [])

  useEffect(() => {
    loadCommunities(debouncedQuery)
  }, [debouncedQuery, loadCommunities])

  const filteredCommunities = useMemo(() => {
    if (activeFilters.length === 0) return communities
    return communities.filter((c) => {
      const type = c.type?.toLowerCase() || ''
      return activeFilters.includes(type)
    })
  }, [communities, activeFilters])

  const handleToggleFilter = (val: string) => {
    setActiveFilters((prev) =>
      prev.includes(val) ? prev.filter((f) => f !== val) : [...prev, val],
    )
  }

  const handleResetFilters = () => {
    setActiveFilters([])
  }

  // 3. Only show the big animation on the FIRST load
  if (isFirstLoad) {
    return <LoadingAnimation />
  }

  // Helper to decide what content to show
  const renderContent = () => {
    // If we are loading (but not first load), show a spinner
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="small" color="#2D6A4F" />
        </View>
      )
    }

    // If no results
    if (
      !Array.isArray(filteredCommunities) ||
      filteredCommunities.length === 0
    ) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No communities found</Text>
        </View>
      )
    }

    // If we have results
    return (
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
        {filteredCommunities.map((c) => {
          const id = String(c.id ?? '')
          return <CommunityItem key={id} community={c} />
        })}
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search communities"
            // Removed onSubmitEditing redundancy since debounce handles it
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="sliders" size={20} color="#2D3748" />
          {activeFilters.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {renderContent()}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeFilters={activeFilters}
        onToggle={handleToggleFilter}
        onReset={handleResetFilters}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: { flex: 1 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ffffffff',
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
    // Removed background color to blend in
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: '#F7FAFC',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  filterList: {
    marginBottom: 24,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  filterOptionActive: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5568',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A5568',
  },
  applyButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
