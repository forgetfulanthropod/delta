import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProjectSwitcher from './ProjectSwitcher';
import { useTheme } from './theme';
import { useAppRole } from '../context/AppRoleContext';
import ConstrainedView from './ConstrainedView';
import { MILKY_BANDS, MILKY_INK, MILKY_INK_SOFT, milkyFill } from './milkyGradients';

export default function OwnerHeader() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { setRole } = useAppRole();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bar,
          milkyFill('header', 'rgba(255,255,255,0.9)'),
          { paddingTop: Math.max(insets.top, 8) },
        ]}
      >
      <ConstrainedView style={styles.inner}>
        <View style={styles.brand}>
          <Text style={[styles.logo, { color: MILKY_BANDS[0] }]}>Δ</Text>
          <View>
            <Text style={[styles.title, { color: t.colors.text }]}>Delta</Text>
            <Text style={[styles.tagline, { color: MILKY_INK_SOFT }]}>
              Remodel with AI
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <ProjectSwitcher />
          <TouchableOpacity
            onPress={() => setRole(null)}
            style={[styles.roleBtn, { borderColor: t.colors.border }]}
          >
            <Text style={{ color: MILKY_INK_SOFT, fontSize: 12, fontWeight: '600' }}>
              Switch role
            </Text>
          </TouchableOpacity>
        </View>
      </ConstrainedView>
      </View>
      <View style={[styles.rainbowBand, milkyFill('rainbowBand', MILKY_BANDS[0])]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 3 },
  bar: {
    paddingBottom: 10,
  },
  rainbowBand: {
    height: 4,
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { fontSize: 28, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  tagline: { fontSize: 11 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});