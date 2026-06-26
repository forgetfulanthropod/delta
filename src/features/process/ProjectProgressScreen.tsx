import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDeltaStore } from '../../store/useDeltaStore';
import { useTheme, ConstrainedView, PrimaryButton } from '../../shared';
import ElegantImage from '../../shared/ElegantImage';
import { computeAreaFlags, overallProgressPercent, flagsNeedingAttention } from './projectProgress';
import { useProjectSnapshot } from './useProjectSnapshot';
import type { ProcessStackParamList } from '../../navigation/types';
import type { AreaFlag, AttentionLevel } from './types';

const FLAG_COLOR: Record<AttentionLevel, string> = {
  complete: '#2e7d32',
  in_progress: '#f9a825',
  needs_attention: '#FF385C',
  not_started: '#bbb',
};

const FLAG_ICON: Record<AttentionLevel, string> = {
  complete: '✓',
  in_progress: '◐',
  needs_attention: '!',
  not_started: '○',
};

export default function ProjectProgressScreen() {
  const t = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ProcessStackParamList>>();
  const { approvedDesign, versions } = useDeltaStore();
  const snapshot = useProjectSnapshot();
  const flags = useMemo(() => computeAreaFlags(snapshot), [snapshot]);
  const attention = flagsNeedingAttention(flags);
  const overall = overallProgressPercent(flags);

  const heroUri =
    approvedDesign?.imageUri ||
    versions[0]?.imageUri ||
    '/test-images/before-after/after-1.jpg';

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      testID="project-progress-screen"
    >
      <ConstrainedView>
        <Text style={[styles.title, { color: t.colors.text }]}>Project overview</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
          TurboTax-style checkpoint — see what’s done and what needs you.
        </Text>

        <View style={[styles.overallBar, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border }]}>
          <Text style={[styles.overallLabel, { color: t.colors.text }]}>Overall progress</Text>
          <View style={[styles.track, { backgroundColor: t.colors.border }]}>
            <View
              style={[styles.fill, { width: `${overall}%`, backgroundColor: t.colors.accent }]}
              testID="progress-overall-fill"
            />
          </View>
          <Text style={[styles.overallPct, { color: t.colors.accent }]}>{overall}% complete</Text>
        </View>

        <ElegantImage
          uri={heroUri}
          label="Current design"
          caption={approvedDesign ? 'Approved concept' : 'Latest render'}
          testID="progress-hero-image"
        />

        {attention.length > 0 ? (
          <View
            style={[styles.alertBanner, { backgroundColor: t.colors.accentLight, borderColor: t.colors.accent }]}
            testID="progress-attention-banner"
          >
            <Text style={[styles.alertTitle, { color: t.colors.accent }]}>
              {attention.length} area{attention.length > 1 ? 's' : ''} need attention
            </Text>
          </View>
        ) : null}

        <View style={styles.flagList} testID="progress-flag-list">
          {flags.map((flag) => (
            <FlagCard key={flag.area} flag={flag} onJump={() => navigation.navigate('GuidedProcess', { step: flag.stepId })} />
          ))}
        </View>

        <PrimaryButton
          title="Continue guided flow"
          onPress={() => navigation.navigate('GuidedProcess', {})}
          style={{ marginTop: 16 }}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={{ color: t.colors.textSecondary, fontWeight: '600' }}>← Back to current step</Text>
        </TouchableOpacity>
      </ConstrainedView>
    </ScrollView>
  );
}

function FlagCard({ flag, onJump }: { flag: AreaFlag; onJump: () => void }) {
  const t = useTheme();
  const color = FLAG_COLOR[flag.status];

  return (
    <TouchableOpacity
      testID={`progress-flag-${flag.area}`}
      onPress={onJump}
      style={[styles.flagCard, { borderColor: t.colors.border, backgroundColor: t.colors.surface }]}
      activeOpacity={0.85}
    >
      <View style={styles.flagHeader}>
        <View style={[styles.flagIcon, { backgroundColor: color }]}>
          <Text style={styles.flagIconText}>{FLAG_ICON[flag.status]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.flagLabel, { color: t.colors.text }]}>{flag.label}</Text>
          <Text style={[styles.flagMessage, { color: t.colors.textSecondary }]}>{flag.message}</Text>
        </View>
        <Text style={[styles.flagPct, { color }]}>{flag.percentComplete}%</Text>
      </View>
      <View style={[styles.miniTrack, { backgroundColor: t.colors.border }]}>
        <View style={[styles.miniFill, { width: `${flag.percentComplete}%`, backgroundColor: color }]} />
      </View>
      {(flag.status === 'needs_attention' || flag.status === 'in_progress') && (
        <Text style={[styles.flagAction, { color: t.colors.accent }]}>Tap to continue →</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 8 },
  subtitle: { fontSize: 15, marginTop: 6, marginBottom: 20, lineHeight: 22 },
  overallBar: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  overallLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  overallPct: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  alertBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  alertTitle: { fontSize: 14, fontWeight: '700' },
  flagList: { marginTop: 12, gap: 12 },
  flagCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  flagHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIconText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  flagLabel: { fontSize: 16, fontWeight: '700' },
  flagMessage: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  flagPct: { fontSize: 14, fontWeight: '800' },
  miniTrack: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  miniFill: { height: '100%' },
  flagAction: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  backLink: { alignItems: 'center', marginTop: 16, padding: 8 },
});