import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from '@/components/Header/Header'
import TabNavigation from '@/components/ProgramsScreen/TabNavigation'
import NotificationsTab from '@/components/ProgramsScreen/NotificationsTab'
import CommunitiesTab from '@/components/ProgramsScreen/CommunitiesTab'

export default function Programs() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = ['Notifications', 'Communities']

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <NotificationsTab />
      case 1:
        return <CommunitiesTab />
      default:
        return <NotificationsTab />
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Community" showDate={false} showClock={false} />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {renderTabContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
})
