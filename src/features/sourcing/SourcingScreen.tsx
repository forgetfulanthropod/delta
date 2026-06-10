import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useDeltaStore } from '../../store/useDeltaStore';
import { useTheme } from '../../shared/theme';
import { EmptyState } from '../../shared';
import type { TabParamList } from '../../navigation/types';

export default function SourcingScreen() {
  const t = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { sourcingItems, approvedDesign, toggleApproveItem, setLaborTasks } = useDeltaStore();

  const approvedItems = sourcingItems.filter((i) => i.approved);
  const total = approvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const generateLaborSchedule = () => {
    const tasks = approvedItems.map((item, index) => ({
      id: `labor-${index}`,
      name: `Install ${item.name}`,
      estimatedHours: Math.max(2, Math.ceil(item.quantity / 40)),
      category: inferCategory(item.name),
    }));

    if (tasks.length === 0) {
      Alert.alert('Sourcing', 'Approve some items first');
      return;
    }

    setLaborTasks(tasks);
    Alert.alert(
      'Labor tasks generated',
      `${tasks.length} tasks ready. Check Scoping (scope tree syncs) and Scheduling tabs.`,
    );
  };

  if (sourcingItems.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.background }]}>
        <Text style={[styles.title, { color: t.colors.text }]}>Sourcing</Text>
        <EmptyState
          title="No materials yet"
          subtitle={
            approvedDesign
              ? 'Send your approved design from Design Studio to populate retailer suggestions with live pricing.'
              : 'Start in Design Studio — take a photo, reimagine with AI, then send to Sourcing.'
          }
          actionLabel="Go to Design Studio"
          onAction={() => navigation.navigate('Design')}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('Design')}
          style={[styles.cta, { backgroundColor: t.colors.accent }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>🎨 Open Design Studio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.background }]}>
      <Text style={[styles.title, { color: t.colors.text }]}>Sourcing</Text>
      <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
        One list. One approval. From the best retailers.
      </Text>

      {approvedDesign && (
        <View
          style={[
            styles.designBanner,
            { backgroundColor: t.colors.accentLight, borderColor: t.colors.accent },
          ]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: t.colors.text }}>
            Sourcing for: {approvedDesign.prompt.slice(0, 60)}
            {approvedDesign.prompt.length > 60 ? '…' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={sourcingItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { borderColor: t.colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: t.colors.text }}>{item.name}</Text>
              <Text style={{ color: t.colors.textSecondary }}>
                {item.retailer} • ${item.price} × {item.quantity}
              </Text>
              {item.url && (
                <TouchableOpacity onPress={() => Linking.openURL(item.url!)} style={{ marginTop: 4 }}>
                  <Text style={{ color: t.colors.accent, fontSize: 12 }}>View at retailer →</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => toggleApproveItem(item.id)}
              style={[
                styles.approveBtn,
                item.approved ? styles.approveBtnActive : { backgroundColor: t.colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.approveText,
                  { color: item.approved ? '#2E7D32' : '#fff' },
                ]}
              >
                {item.approved ? 'Approved ✓' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={[styles.footer, { borderColor: t.colors.border }]}>
        <Text style={[styles.total, { color: t.colors.text }]}>
          Approved Total: ${total.toFixed(2)}
        </Text>
        <Button
          title="Submit Approved Purchases"
          onPress={() => Alert.alert('Sourcing', 'Purchases submitted!')}
          disabled={approvedItems.length === 0}
          color={t.colors.accent}
        />
        <View style={{ height: 12 }} />
        <Button
          title="Generate Labor Schedule"
          onPress={generateLaborSchedule}
          disabled={approvedItems.length === 0}
          color="#c62828"
        />
      </View>
    </View>
  );
}

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('light') || n.includes('led') || n.includes('electrical')) return 'electrical';
  if (n.includes('floor') || n.includes('lvp') || n.includes('oak')) return 'flooring';
  if (n.includes('paint')) return 'painting';
  if (n.includes('faucet') || n.includes('sink') || n.includes('plumb')) return 'plumbing';
  if (n.includes('cabinet') || n.includes('counter') || n.includes('hardware')) return 'carpentry';
  return 'finish';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  subtitle: { fontSize: 20, marginTop: 8, marginBottom: 16 },
  designBanner: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  approveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16 },
  approveBtnActive: { backgroundColor: '#E8F5E9' },
  approveText: { fontWeight: '500' },
  footer: { paddingTop: 20, borderTopWidth: 1 },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  cta: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});