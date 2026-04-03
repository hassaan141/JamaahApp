import React from 'react'
import { View, StyleSheet } from 'react-native'
// import TabNavigation from '@/components/ProgramsScreen/TabNavigation'
import CommunitiesTab from '@/components/ProgramsScreen/CommunitiesTab'
import { useTheme } from '@/theme'

export default function Programs() {
  const { theme } = useTheme()
  // const [activeTab, setActiveTab] = useState(0)

  // const tabs = ['Communities']

  // const renderTabContent = () => {
  //   return <CommunitiesTab />
  // }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <CommunitiesTab />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
})
