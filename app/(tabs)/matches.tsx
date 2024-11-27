import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Matches() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Matches</Text>
      <Text style={styles.subtitle}>Próximamente podrás ver tus matches aquí</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
