import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface HeaderProps {
  title?: string
  showDate?: boolean
  showClock?: boolean
}

const Header: React.FC<HeaderProps> = ({
  title = 'Assalaamu Alaikum',
  showDate = true,
  showClock = true,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const formatCurrentTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

  useEffect(() => {
    if (!showClock) return
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(clockInterval)
  }, [showClock])

  return (
    <View
      style={[styles.header, !showDate && !showClock && styles.headerCompact]}
    >
      <Text
        style={[
          styles.headerTitle,
          !showDate && !showClock && styles.headerTitleCompact,
        ]}
      >
        {title}
      </Text>
      {showDate && <Text style={styles.headerDate}>{currentDate}</Text>}
      {showClock && (
        <Text style={styles.clockText}>{formatCurrentTime(currentTime)}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerCompact: {
    paddingTop: 50,
    paddingBottom: 5,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228f2bff',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerTitleCompact: {
    fontSize: 22,
    marginBottom: 0,
  },
  headerDate: {
    fontSize: 16,
    color: '#61706aff',
    opacity: 0.9,
    textAlign: 'center',
  },
  clockText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#000000ff',
    textAlign: 'center',
    marginTop: 10,
  },
})

export default Header
export { Header }
