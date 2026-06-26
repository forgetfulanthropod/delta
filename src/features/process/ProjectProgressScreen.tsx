import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDeltaStore } from '../../store/useDeltaStore';
import { useTheme, ConstrainedView, PrimaryButton } from '../../shared';
import ElegantImage from '../../shared/ElegantImage';
import MilkyBackdrop from '../../shared/MilkyBackdrop';
import { MILKY_BANDS, MILKY_INK, MILKY_INK_SOFT, milkyFill } from '../../shared/milkyGradients';
import { computeAreaFlags, overallProgressPercent, flagsNeedingAttention } from './projectProgress';
import { useProjectSnapshot } from './useProjectSnapshot';
import type { ProcessStackParamList } from '../../navigation/types';
import type { AreaFlag, AttentionLevel } from './types';

const FLAG_COLOR: Record<AttentionLevel, string> = {
  complete: MILKY_BANDS[3],
  in_progress: MILKY_BANDS[2],
  needs_attention: MILKY_BANDS[1],
  not_started: '#D8D0E8',
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
    <View style={styles.screenWrap} testID="project-progress-screen">
      <MilkyBackdrop />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ConstrainedView style={styles.centered}>
        <Text style={[styles.title, { color: t.colors.text }]}>Project overview</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
          TurboTax-style checkpoint — see what’s done and what needs you.
        </Text>

        <View style={[styles.overallBar, milkyFill('card', '#FFFFFF'), { borderColor: t.colors.border }]}>
          <Text style={[styles.overallLabel, { color: t.colors.text }]}>Overall progress</Text>
          <View style={styles.track}>
            <View
              style={[styles.fill, milkyFill('progress', '#C4B5FD'), { width: `${overall}%` }]}
              testID="progress-overall-fill"
            />
          </View>
          <Text style={[styles.overallPct, { color: MILKY_INK }]}>{overall}% complete</Text>
        </View>

        <ElegantImage
          uri={heroUri}
          label="Current design"
          caption={approvedDesign ? 'Approved concept' : 'Latest render'}
          testID="progress-hero-image"
        />

        {attention.length > 0 ? (
          <View
            style={[styles.alertBanner, milkyFill('chipActive', '#EDE9FE'), { borderColor: t.colors.border }]}
            testID="progress-attention-banner"
          >
            <Text style={[styles.alertTitle, { color: MILKY_INK }]}>
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
          <Text style={{ color: MILKY_INK_SOFT, fontWeight: '600' }}>← Back to current step</Text>
        </TouchableOpacity>
      </ConstrainedView>
    </ScrollView>
    </View>
  );
}

function FlagCard({ flag, onJump }: { flag: AreaFlag; onJump: () => void }) {
  const t = useTheme();
  const color = FLAG_COLOR[flag.status];

  return (
    <TouchableOpacity
      testID={`progress-flag-${flag.area}`}
      onPress={onJump}
      style={[styles.flagCard, milkyFill('card', '#FFFFFF'), { borderColor: t.colors.border }]}
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
        <Text style={[styles.flagAction, { color: MILKY_INK }]}>Tap to continue →</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screenWrap: { flex: 1, position: 'relative' },
  screen: { flex: 1, zIndex: 1 },
  content: { paddingBottom: 48, paddingTop: 16 },
  centered: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 6, marginBottom: 20, lineHeight: 22, textAlign: 'center' },
  overallBar: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  overallLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.55)' },
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
  flagIconText: { color: MILKY_INK, fontWeight: '800', fontSize: 14 },
  flagLabel: { fontSize: 16, fontWeight: '700' },
  flagMessage: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  flagPct: { fontSize: 14, fontWeight: '800' },
  miniTrack: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  miniFill: { height: '100%' },
  flagAction: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  backLink: { alignItems: 'center', marginTop: 16, padding: 8 },
});