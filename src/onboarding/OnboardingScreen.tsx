import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Delta</Text>
      <Text style={styles.subtitle}>Rivvr Homes • Remodel smarter</Text>

      <Text style={styles.question}>I want to…</Text>

      <TouchableOpacity style={styles.card} onPress={() => onSelectRole('owner')}>
        <Text style={styles.cardTitle}>Remodel my space</Text>
        <Text style={styles.cardDesc}>Take photos, reimagine, source materials, and hire workers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => onSelectRole('worker')}>
        <Text style={styles.cardTitle}>Work on spaces</Text>
        <Text style={styles.cardDesc}>Join jobs, get paid $600 per day, manage your schedule</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  question: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  cardDesc: { fontSize: 15, color: '#555' },
});