import React from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { useDeltaStore } from '../../store/useDeltaStore';

export default function SourcingScreen() {
  const { sourcingItems, toggleApproveItem, setLaborTasks } = useDeltaStore();

  const approvedItems = sourcingItems.filter(i => i.approved);
  const total = approvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const generateLaborSchedule = () => {
    // Convert approved sourcing items into labor tasks
    const tasks = approvedItems.map((item, index) => ({
      id: `labor-${index}`,
      name: `Install ${item.name}`,
      estimatedHours: Math.max(2, Math.ceil(item.quantity / 40)), // rough estimate
    }));

    if (tasks.length === 0) {
      Alert.alert('Sourcing', 'Approve some items first');
      return;
    }

    setLaborTasks(tasks);
    Alert.alert('Labor', `Labor schedule generated for ${tasks.length} tasks! Check the Labor tab.`);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sourcing</Text>
      <Text style={styles.subtitle}>One list. One approval. From the best retailers.</Text>

      <FlatList
        data={sourcingItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <Text>{item.retailer} • ${item.price} × {item.quantity}</Text>
              {item.url && (
                <TouchableOpacity onPress={() => Linking.openURL(item.url!)} style={{ marginTop: 4 }}>
                  <Text style={{ color: '#0066cc', fontSize: 12 }}>View at retailer →</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => toggleApproveItem(item.id)}
              style={[
                styles.approveBtn,
                item.approved ? styles.approveBtnActive : styles.approveBtnInactive,
              ]}>
              <Text
                style={[
                  styles.approveText,
                  item.approved ? styles.approveTextActive : styles.approveTextInactive,
                ]}>
                {item.approved ? 'Approved ✓' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Approved Total: ${total.toFixed(2)}</Text>
        <Button title="Submit Approved Purchases" onPress={() => Alert.alert('Sourcing', 'Purchases submitted!')} disabled={approvedItems.length === 0} />
        <View style={{ height: 12 }} />
        <Button title="Generate Labor Schedule" onPress={generateLaborSchedule} disabled={approvedItems.length === 0} color="#c62828" />
        <View style={{ height: 8 }} />
        <Button title="Clear All (Phase 3 persist demo)" onPress={() => { useDeltaStore.getState().resetAll(); Alert.alert('Cleared', 'Store reset (persisted data cleared on next load).'); }} color="#666" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#fff', 
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20, 
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: { fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1 },
  subtitle: { fontSize: 20, color: '#666', marginTop: 8, marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  approveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16 },
  approveBtnInactive: { backgroundColor: '#FF385C' },
  approveBtnActive: { backgroundColor: '#E8F5E9' },
  approveText: { fontWeight: '500' },
  approveTextInactive: { color: '#fff' },
  approveTextActive: { color: '#2E7D32' },
  footer: { paddingTop: 20, borderTopWidth: 1, borderColor: '#ddd' },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});