import React from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { SourcingItem } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';

const SAMPLE_ITEMS: SourcingItem[] = [
  { id: '1', name: 'LVP Flooring - Oak', retailer: "Lowe's", price: 3.49, quantity: 120, approved: false },
  { id: '2', name: 'Matte Black Faucet', retailer: 'Amazon', price: 89, quantity: 2, approved: false },
  { id: '3', name: 'LED Recessed Lights 6-pack', retailer: 'Home Depot', price: 42, quantity: 8, approved: false },
];

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
      alert('Approve some items first');
      return;
    }

    setLaborTasks(tasks);
    alert(`Labor schedule generated for ${tasks.length} tasks! Check the Labor tab.`);
  };

  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <Text className="text-4xl font-semibold tracking-tight text-[#222]">Sourcing</Text>
      <Text className="text-xl text-[#666] mt-1">One list. One approval. From the best retailers.</Text>

      <FlatList
        data={sourcingItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <Text>{item.retailer} • ${item.price} × {item.quantity}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleApproveItem(item.id)}
              className={`px-5 py-2 rounded-2xl ${item.approved ? 'bg-[#E8F5E9]' : 'bg-[#FF385C]'}`}>
              <Text className={`font-medium ${item.approved ? 'text-[#2E7D32]' : 'text-white'}`}>
                {item.approved ? 'Approved ✓' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Approved Total: ${total.toFixed(2)}</Text>
        <Button title="Submit Approved Purchases" onPress={() => alert('Purchases submitted!')} disabled={approvedItems.length === 0} />
        <View style={{ height: 12 }} />
        <Button title="Generate Labor Schedule" onPress={generateLaborSchedule} disabled={approvedItems.length === 0} color="#c62828" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  footer: { paddingTop: 20, borderTopWidth: 1, borderColor: '#ddd' },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});