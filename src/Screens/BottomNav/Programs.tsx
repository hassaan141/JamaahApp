import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from '@/components/Header/Header'
import TabNavigation from '@/components/ProgramsScreen/TabNavigation'
import NotificationsTab from '@/components/ProgramsScreen/NotificationsTab'
import MyNotificationsTab from '@/components/ProgramsScreen/MyNotificationsTab'
import CommunitiesTab from '@/components/ProgramsScreen/CommunitiesTab'
import { ENV } from '@/core/env'

export default function Programs() {
  const [activeTab, setActiveTab] = useState(0)
  const hideMyNotifications = !!ENV.TEST_PROGRAMS_SCREEN

  const tabs = hideMyNotifications
    ? ['Notifications', 'Communities']
    : ['Notifications', 'My Notifications', 'Communities']

  const renderTabContent = () => {
    if (hideMyNotifications) {
      switch (activeTab) {
        case 0:
          return <NotificationsTab />
        case 1:
          return <CommunitiesTab />
        default:
          return <NotificationsTab />
      }
    } else {
      switch (activeTab) {
        case 0:
          return <NotificationsTab />
        case 1:
          return <MyNotificationsTab />
        case 2:
          return <CommunitiesTab />
        default:
          return <NotificationsTab />
      }
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
