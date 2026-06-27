import React from 'react'
import { StyleSheet } from 'react-native'
// import TabNavigation from '@/components/ProgramsScreen/TabNavigation'
import CommunitiesTab from '@/components/ProgramsScreen/CommunitiesTab'
import GradientBackground from '@/components/GradientBackground'

export default function Programs() {
  // const [activeTab, setActiveTab] = useState(0)

  // const tabs = ['Communities']

  // const renderTabContent = () => {
  //   return <CommunitiesTab />
  // }

  return (
    <GradientBackground style={styles.container}>
      <CommunitiesTab />
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
  },
})
