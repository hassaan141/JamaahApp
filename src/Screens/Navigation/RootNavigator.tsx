import React, { useEffect, useRef } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Animated, Easing, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Home from '../BottomNav/Home'
import Map from '../BottomNav/Map'
import Account from '../BottomNav/Account'
import Programs from '../BottomNav/Programs'

import Masjids from '@/Screens/Navigation/Masjids'
import OrganizationDetail from '@/Screens/Navigation/OrganizationDetail'
import Settings from '@/Screens/Navigation/Settings'
import Notifications from '@/Screens/Navigation/Notifications'
import ProfileSettings from './Settings/ProfileSettings'
import AccountSettings from './Settings/AccountSettings'
import OurMission from './Settings/OurMission'
import HelpSupport from './Settings/HelpSupport'
import type { Organization } from '@/types'

// Auth screens for guest mode navigation
import WelcomeScreen from '@/Screens/Auth/WelcomeScreen'
import SignIn from '@/Screens/Auth/SignIn'
import SignUp from '@/Screens/Auth/SignUp'
import ForgotPassword from '@/Screens/Auth/ForgotPassword'
import UserTypeSelection from '@/Screens/Auth/UserTypeSelection'
import OrganizationSignUp from '@/Screens/Auth/OrganizationSignUp'

export type RootStackParamList = {
  // Welcome/landing screen (shown after sign out)
  Welcome: undefined
  Tabs: undefined
  Masjids: undefined
  OrganizationDetail: { org: Organization & { is_following?: boolean } }
  Settings: undefined
  ProfileSettings: undefined
  AccountSettings: undefined
  OurMission: undefined
  HelpSupport: undefined
  Notifications: undefined
  // Auth screens (accessible for guest mode sign-up prompts)
  SignIn: undefined
  SignUp: undefined
  ForgotPassword: undefined
  UserTypeSelection: undefined
  OrganizationSignUp: undefined
}

type TabParamList = {
  Home: undefined
  Map: undefined
  Organization: undefined
  Account: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator<RootStackParamList>()

const TAB_COLORS = {
  background: '#FFFFFF',
  border: '#E2E8F0',
  active: '#2F855A',
  indicator: '#48BB78',
  inactive: '#6B7280',
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: TAB_COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 5,
  },
  tabBarItem: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  iconFrame: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 3,
    borderRadius: 999,
    backgroundColor: TAB_COLORS.indicator,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 0,
  },
})

function AnimatedTabIcon({
  iconName,
  color,
  focused,
}: {
  iconName: React.ComponentProps<typeof Feather>['name']
  color: string
  focused: boolean
}) {
  const translateY = useRef(new Animated.Value(focused ? -1 : 0)).current
  const scale = useRef(new Animated.Value(focused ? 1.06 : 1)).current
  const indicatorOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current
  const indicatorScale = useRef(new Animated.Value(focused ? 1 : 0.7)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: focused ? -1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: focused ? 1.06 : 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: focused ? 1 : 0,
        duration: 160,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(indicatorScale, {
        toValue: focused ? 1 : 0.7,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [focused, indicatorOpacity, indicatorScale, scale, translateY])

  return (
    <Animated.View
      style={[
        styles.iconFrame,
        {
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Feather name={iconName} size={21} color={color} />
      <Animated.View
        style={[
          styles.indicator,
          {
            opacity: indicatorOpacity,
            transform: [{ scaleX: indicatorScale }],
          },
        ]}
      />
    </Animated.View>
  )
}

function TabNavigator() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'] = 'home'
          if (route.name === 'Home') iconName = 'home'
          else if (route.name === 'Map') iconName = 'map'
          else if (route.name === 'Organization') iconName = 'calendar'
          else if (route.name === 'Account') iconName = 'user'
          return (
            <AnimatedTabIcon
              iconName={iconName}
              color={color}
              focused={focused}
            />
          )
        },
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            height: 56 + Math.max(insets.bottom, 8),
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.label,
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

type RootNavigatorProps = {
  initialRouteName?: keyof RootStackParamList
}

export default function RootNavigator({
  initialRouteName = 'Tabs',
}: RootNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Masjids" component={Masjids} />
      <Stack.Screen name="OrganizationDetail" component={OrganizationDetail} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
      <Stack.Screen name="AccountSettings" component={AccountSettings} />
      <Stack.Screen name="OurMission" component={OurMission} />
      <Stack.Screen name="HelpSupport" component={HelpSupport} />
      <Stack.Screen name="Notifications" component={Notifications} />
      {/* Auth screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
      <Stack.Screen name="OrganizationSignUp" component={OrganizationSignUp} />
    </Stack.Navigator>
  )
}
