import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import TabNavigation from '@/components/ProgramsScreen/TabNavigation'
import CommunitiesTab from '@/components/ProgramsScreen/CommunitiesTab'

export default function Programs() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = ['Communities']

  const renderTabContent = () => {
    return <CommunitiesTab />
  }

  return (
    <View style={styles.container}>
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
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
})
