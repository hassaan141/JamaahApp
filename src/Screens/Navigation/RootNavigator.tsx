import React from 'react'
import Feather from '@expo/vector-icons/Feather'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import Home from '../BottomNav/Home'
import Map from '../BottomNav/Map'
import Account from '../BottomNav/Account'
import Programs from '../BottomNav/Programs'
import { View, Text } from 'react-native'

type TabParamList = {
  Home: undefined
  Map: undefined
  Programs: undefined
  Account: undefined
}
const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof TabParamList } }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'] = 'home'
          if (route.name === 'Home') iconName = 'home'
          else if (route.name === 'Map') iconName = 'map'
          else if (route.name === 'Programs') iconName = 'calendar'
          else if (route.name === 'Account') iconName = 'user'
          return <Feather name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#34660bff',
        tabBarInactiveTintColor: '#209b6cff',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="Programs" component={Programs} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  )
}

// Placeholder extra screens (e.g., Masjids, OrganizationDetail) – wire real ones later
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  )
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Masjids"
        children={() => <PlaceholderScreen title="Masjids" />}
      />
      <Stack.Screen
        name="OrganizationDetail"
        children={() => <PlaceholderScreen title="Organization Detail" />}
      />
    </Stack.Navigator>
  )
}
