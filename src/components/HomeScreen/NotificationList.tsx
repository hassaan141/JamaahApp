import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import { isNewAnnouncement } from '@/Utils/datetime'
import {
  fetchMyAnnouncements,
  type Announcement,
} from '@/Supabase/fetchMyAnnouncements'
import { useNavigation } from '@react-navigation/native'

const TABS = [
  // { label: 'All', value: 'ALL' },
  { label: 'Classes', value: 'CLASSES' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Volunteer', value: 'VOLUNTEER' },
  // { label: 'Janazah', value: 'JANAZAH' },
]

const NotificationList: React.FC<{ refreshKey?: boolean }> = ({
  refreshKey,
}) => {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState('CLASSES')
  const [isExpanded, setIsExpanded] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.95))[0]
  const didFetchRef = React.useRef(false)

  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true

    let mounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchMyAnnouncements()
        if (mounted) setAnnouncements(data ?? [])
      } catch {
        if (mounted) setAnnouncements([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
      didFetchRef.current = false
    }
  }, [refreshKey])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: loading ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: loading ? 0.95 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [loading, fadeAnim, scaleAnim])

  useEffect(() => {
    setIsExpanded(false)
  }, [activeTab])

  const filteredAnnouncements = useMemo(() => {
    // if (activeTab === 'ALL') return announcements

    return announcements.filter((item) => {
      const type = item.post_type || ''

      if (activeTab === 'CLASSES') {
        return type === 'Repeating_classes'
      }
      if (activeTab === 'EVENTS') {
        return type === 'Event'
      }
      if (activeTab === 'VOLUNTEER') {
        return type === 'Volunteerng'
      }
      return true
    })
  }, [announcements, activeTab])

  const visibleAnnouncements = isExpanded
    ? filteredAnnouncements
    : filteredAnnouncements.slice(0, 2)

  const hiddenCount = Math.max(0, filteredAnnouncements.length - 2)

  const newAnnouncementCount = announcements.filter((a) =>
    isNewAnnouncement(a.created_at),
  ).length

  const handleExpand = () => setIsExpanded(true)
  const handleCollapse = () => setIsExpanded(false)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="bell" size={16} color="#4A5568" />
          <Text style={styles.headerTitle}>Upcoming</Text>
        </View>
        {newAnnouncementCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{newAnnouncementCount}</Text>
          </View>
        )}
      </View>

      {!loading && announcements.length > 0 && (
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value
              return (
                <TouchableOpacity
                  key={tab.value}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.activeTabText]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      <Animated.View
        style={[
          styles.notificationList,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : announcements.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyStateContainer}
            onPress={() => navigation.navigate('Organization' as never)}
            activeOpacity={0.7}
          >
            <Feather
              name="plus-circle"
              size={40}
              color="#48BB78"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Please start following an organization to get events and classes
              notifications
            </Text>
          </TouchableOpacity>
        ) : filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>
              No {activeTab.toLowerCase()} found.
            </Text>
          </View>
        ) : (
          <>
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                showEditButton={false}
                showPublishedDate={false}
              />
            ))}

            {!isExpanded && hiddenCount > 0 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={handleExpand}
                activeOpacity={0.7}
              >
                <Text style={styles.expandButtonText}>
                  +{hiddenCount} more{' '}
                  {activeTab.toLowerCase() === 'all'
                    ? 'notifications'
                    : activeTab.toLowerCase()}
                </Text>
              </TouchableOpacity>
            )}

            {isExpanded && (
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={handleCollapse}
                activeOpacity={0.7}
              >
                <Text style={styles.collapseButtonText}>Show less</Text>
                <Feather name="chevron-up" size={16} color="#718096" />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#48BB78',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationList: {
    gap: 12,
  },
  loadingText: {
    color: '#718096',
    textAlign: 'center',
    padding: 20,
  },
  expandButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '500',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 4,
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4A5568',
    maxWidth: 260,
  },
})

export default NotificationList

// import React, { useEffect, useState, useMemo } from 'react'
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
// } from 'react-native'
// import Feather from '@expo/vector-icons/Feather'
// import AnnouncementCard from '@/components/Shared/AnnouncementCard'
// import {
//   fetchMyAnnouncements,
//   type Announcement,
// } from '@/Supabase/fetchMyAnnouncements'
// import { useNavigation } from '@react-navigation/native'

// // Helper to render a specific section
// const AnnouncementSection = ({
//   title,
//   icon,
//   data,
//   color
// }: {
//   title: string,
//   icon: keyof typeof Feather.glyphMap,
//   data: Announcement[],
//   color: string
// }) => {
//   const [expanded, setExpanded] = useState(false)

//   // If no data for this section, render nothing
//   if (!data || data.length === 0) return null

//   // Logic: Show all if expanded, otherwise only show top 2
//   const visibleItems = expanded ? data : data.slice(0, 2)
//   const hiddenCount = data.length - 2

//   return (
//     <View style={styles.sectionContainer}>
//       {/* Section Header */}
//       <View style={styles.sectionHeader}>
//         <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
//           <Feather name={icon} size={14} color={color} />
//         </View>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <View style={styles.countBadge}>
//           <Text style={styles.countText}>{data.length}</Text>
//         </View>
//       </View>

//       {/* Cards */}
//       <View style={styles.cardList}>
//         {visibleItems.map((item) => (
//           <AnnouncementCard
//             key={item.id}
//             announcement={item}
//             showEditButton={false}
//             showPublishedDate={false}
//           />
//         ))}
//       </View>

//       {/* Expand/Collapse Button specific to this section */}
//       {hiddenCount > 0 && !expanded && (
//         <TouchableOpacity
//           style={styles.showMoreButton}
//           onPress={() => setExpanded(true)}
//           activeOpacity={0.7}
//         >
//           <Text style={[styles.showMoreText, { color }]}>
//             Show {hiddenCount} more {title.toLowerCase()}
//           </Text>
//           <Feather name="chevron-down" size={16} color={color} />
//         </TouchableOpacity>
//       )}

//       {expanded && data.length > 2 && (
//         <TouchableOpacity
//           style={styles.showMoreButton}
//           onPress={() => setExpanded(false)}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.showMoreTextSecondary}>Show less</Text>
//           <Feather name="chevron-up" size={16} color="#718096" />
//         </TouchableOpacity>
//       )}
//     </View>
//   )
// }

// const NotificationList: React.FC<{ refreshKey?: boolean }> = ({
//   refreshKey,
// }) => {
//   const navigation = useNavigation()
//   const [announcements, setAnnouncements] = useState<Announcement[]>([])
//   const [loading, setLoading] = useState(true)

//   // Animation for the whole container entry
//   const fadeAnim = useState(new Animated.Value(0))[0]

//   useEffect(() => {
//     let mounted = true
//     const fetchData = async () => {
//       try {
//         setLoading(true)
//         const data = await fetchMyAnnouncements()
//         if (mounted) setAnnouncements(data ?? [])
//       } catch {
//         if (mounted) setAnnouncements([])
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     }
//     fetchData()
//     return () => { mounted = false }
//   }, [refreshKey])

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: loading ? 0 : 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start()
//   }, [loading, fadeAnim])

//   // --- GROUPING LOGIC ---
//   const groupedData = useMemo(() => {
//     const groups = {
//       events: [] as Announcement[],
//       classes: [] as Announcement[],
//       volunteer: [] as Announcement[],
//     }

//     announcements.forEach((a) => {
//       const type = a.post_type || ''
//       if (type === 'Repeating_classes') {
//         groups.classes.push(a)
//       } else if (type === 'Volunteerng') {
//         groups.volunteer.push(a)
//       } else {
//         // Groups 'Event' and 'Janazah' together as general Events
//         groups.events.push(a)
//       }
//     })
//     return groups
//   }, [announcements])

//   return (
//     <View style={styles.container}>
//       {/* Main Container Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Feather name="bell" size={18} color="#2D3748" />
//           <Text style={styles.headerTitle}>Updates & Opportunities</Text>
//         </View>
//       </View>

//       <Animated.View style={{ opacity: fadeAnim }}>
//         {loading ? (
//           <Text style={styles.loadingText}>Loading...</Text>
//         ) : announcements.length === 0 ? (
//           <TouchableOpacity
//             style={styles.emptyStateContainer}
//             onPress={() => navigation.navigate('Organization' as never)}
//           >
//             <Feather name="plus-circle" size={40} color="#48BB78" style={{ marginBottom: 8 }} />
//             <Text style={styles.emptyText}>
//               Follow an organization to see updates here.
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.sectionsWrapper}>
//             {/* 1. Events Section */}
//             <AnnouncementSection
//               title="Events"
//               icon="calendar"
//               data={groupedData.events}
//               color="#3182CE" // Blue
//             />

//             {/* 2. Classes Section */}
//             <AnnouncementSection
//               title="Classes"
//               icon="book-open"
//               data={groupedData.classes}
//               color="#805AD5" // Purple
//             />

//             {/* 3. Volunteer Section */}
//             <AnnouncementSection
//               title="Volunteering"
//               icon="heart"
//               data={groupedData.volunteer}
//               color="#E53E3E" // Red
//             />
//           </View>
//         )}
//       </Animated.View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EDF2F7',
//     paddingBottom: 12,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A202C',
//     marginLeft: 10,
//   },
//   loadingText: {
//     textAlign: 'center',
//     color: '#718096',
//     padding: 20,
//   },
//   sectionsWrapper: {
//     gap: 24, // Space between big sections (Events vs Classes)
//   },
//   // --- Section Styles ---
//   sectionContainer: {
//     gap: 12,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   iconBox: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#2D3748',
//     flex: 1,
//   },
//   countBadge: {
//     backgroundColor: '#EDF2F7',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   countText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#718096',
//   },
//   cardList: {
//     gap: 12, // Space between cards
//   },
//   showMoreButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     backgroundColor: '#F7FAFC',
//     borderRadius: 8,
//     marginTop: 4,
//   },
//   showMoreText: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginRight: 6,
//   },
//   showMoreTextSecondary: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: '#718096',
//     marginRight: 6,
//   },
//   emptyStateContainer: {
//     alignItems: 'center',
//     padding: 24,
//   },
//   emptyText: {
//     color: '#718096',
//     textAlign: 'center',
//   },
// })

// export default NotificationList
