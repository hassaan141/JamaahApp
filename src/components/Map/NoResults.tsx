import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function NoResults({ message }: { message?: string }) {
  return (
    <View style={styles.noResultsContainer}>
      <Feather name="search" size={48} color="#CBD5E0" />
      <Text style={styles.noResultsText}>{message ?? 'No results found'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  noResultsContainer: { alignItems: 'center', paddingVertical: 40 },
  noResultsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
  },
})
