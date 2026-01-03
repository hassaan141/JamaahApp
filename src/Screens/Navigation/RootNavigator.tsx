import React from 'react'
import Feather from '@expo/vector-icons/Feather'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Home from '../BottomNav/Home'
import Map from '../BottomNav/Map'
import Account from '../BottomNav/Account'
import Programs from '../BottomNav/Programs'

import Masjids from '@/Screens/Navigation/Masjids'
import OrganizationDetail from '@/Screens/Navigation/OrganizationDetail'
import Settings from '@/Screens/Navigation/Settings'
import Notifications from '@/Screens/Navigation/Notifications'
import type { Organization } from '@/types' // <--- 1. Added Import

export type RootStackParamList = {
  Tabs: undefined
  Masjids: undefined
  // 2. Updated to expect the 'org' object instead of just 'id'
  OrganizationDetail: { org: Organization & { is_following?: boolean } }
  Settings: undefined
  Notifications: undefined
  SignIn: undefined
}

type TabParamList = {
  Home: undefined
  Map: undefined
  Organization: undefined
  Account: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator<RootStackParamList>()

function TabNavigator() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarIcon: ({ color }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'] = 'home'
          if (route.name === 'Home') iconName = 'home'
          else if (route.name === 'Map') iconName = 'map'
          else if (route.name === 'Organization') iconName = 'calendar'
          else if (route.name === 'Account') iconName = 'user'
          return <Feather name={iconName} size={24} color={color} />
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: insets.bottom,
          height: 45 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: 'none',
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen
        name="Organization"
        component={Programs}
        options={{ tabBarLabel: 'Programs' }}
      />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Masjids" component={Masjids} />
      <Stack.Screen name="OrganizationDetail" component={OrganizationDetail} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  )
}
