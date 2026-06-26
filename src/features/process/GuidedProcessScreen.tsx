import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDeltaStore } from '../../store/useDeltaStore';
import {
  useTheme,
  ConstrainedView,
  PrimaryButton,
  SecondaryButton,
  ReadyToGoCostPill,
} from '../../shared';
import ElegantImage from '../../shared/ElegantImage';
import MilkyBackdrop from '../../shared/MilkyBackdrop';
import GuidedStepCard from '../../shared/GuidedStepCard';
import { MILKY_INK, MILKY_INK_SOFT, milkyFill } from '../../shared/milkyGradients';
import BeforeAfterSlider from '../design/BeforeAfterSlider';
import CameraScreen from '../design/CameraScreen';
import { DesignVersion } from '../design/types';
import { apiUrl } from '../../shared/api';
import { generateSchedule } from '../labor/scheduler';
import {
  computeAreaFlags,
  canAdvanceFromStep,
  getRecommendedStep,
  getNextStep,
  getPreviousStep,
} from './projectProgress';
import { getStepMeta, STYLE_OPTIONS, PALETTE_OPTIONS, LAYOUT_OPTIONS } from './stepMachine';
import { buildSourcingSuggestions, laborTasksFromSourcing } from './guidedActions';
import { useProjectSnapshot } from './useProjectSnapshot';
import type { ProcessStackParamList } from '../../navigation/types';
import type { GuidedStepId } from './types';

export default function GuidedProcessScreen() {
  const t = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ProcessStackParamList>>();
  const route = useRoute<RouteProp<ProcessStackParamList, 'GuidedProcess'>>();
  const store = useDeltaStore();
  const {
    currentProjectId,
    projects,
    renameProject,
    approvedDesign,
    setApprovedDesign,
    versions,
    addVersion,
    addSourcingItems,
    sourcingItems,
    toggleApproveItem,
    setLaborTasks,
    laborTasks,
    toggleScopeItem,
    scopeCompleted,
    baseImageUri,
    setBaseImageUri,
    designPrompt,
    setDesignPrompt,
    designTweaks,
    setDesignTweaks,
    hasScheduleBuilt,
    setHasScheduleBuilt,
  } = store;

  const [stepId, setStepId] = useState<GuidedStepId>(
    route.params?.step ?? 'welcome',
  );
  const [connectedProvider] = useState<string | null>('x');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [materialIndex, setMaterialIndex] = useState(0);

  useEffect(() => {
    if (route.params?.step) setStepId(route.params.step);
  }, [route.params?.step]);

  const snapshot = useProjectSnapshot();
  const projectName = snapshot.projectName || 'My Remodel';
  const baseImage = snapshot.baseImage;
  const prompt = designPrompt;
  const tweaks = designTweaks;

  const meta = getStepMeta(stepId);
  const flags = useMemo(() => computeAreaFlags(snapshot), [snapshot]);
  const attentionCount = flags.filter(
    (f) => f.status === 'needs_attention' || f.status === 'in_progress',
  ).length;
  const canContinue = canAdvanceFromStep(stepId, snapshot);
  const progressPct = Math.round((meta.stepIndex / meta.totalSteps) * 100);

  const goNext = useCallback(() => {
    if (!canAdvanceFromStep(stepId, snapshot)) return;
    const next = getNextStep(stepId);
    if (next) setStepId(next);
  }, [stepId, snapshot]);

  const goBack = useCallback(() => {
    const prev = getPreviousStep(stepId);
    if (prev) setStepId(prev);
  }, [stepId]);

  const resumeRecommended = () => {
    setStepId(getRecommendedStep(snapshot));
  };

  const handlePhoto = (uri: string) => {
    setBaseImageUri(uri);
    setShowCamera(false);
  };

  const loadExample = () => {
    setBaseImageUri('/test-images/before-after/before-1.jpg');
    if (currentProjectId) renameProject(currentProjectId, 'The Oak Street House');
  };

  const generateDesign = async () => {
    if (!baseImage) return;
    setIsGenerating(true);
    const genTweaks =
      tweaks.style && tweaks.colorPalette && tweaks.layout
        ? tweaks
        : { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' };
    const enhanced = `${prompt} in ${genTweaks.style} style with ${genTweaks.colorPalette} color palette and ${genTweaks.layout} layout.`;
    try {
      const res = await fetch(apiUrl('/api/reimagine'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUri: baseImage,
          prompt: enhanced,
          provider: connectedProvider || 'x',
          apiKey: 'demo-x',
        }),
      });
      const data = await res.json();
      if (data.imageUri) {
        addVersion({
          id: Date.now().toString(),
          imageUri: data.imageUri,
          prompt,
          tweaks: { ...(tweaks.style ? tweaks : { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' }) },
          createdAt: new Date().toISOString(),
        });
        setIsGenerating(false);
        return;
      }
    } catch {
      /* fallback below */
    }
    const fallbacks = [
      '/test-images/before-after/after-1.jpg',
      '/ai-room-1.jpg',
      '/ai-room-2.jpg',
    ];
    addVersion({
      id: Date.now().toString(),
      imageUri: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      prompt,
      tweaks: { ...(tweaks.style ? tweaks : { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' }) },
      createdAt: new Date().toISOString(),
    });
    setIsGenerating(false);
  };

  const approveAndSource = (version: DesignVersion) => {
    setApprovedDesign(version);
    const items = buildSourcingSuggestions(version);
    addSourcingItems(items);
    Alert.alert('Design approved', `${items.length} materials added to your list.`);
  };

  const approveCurrentMaterial = () => {
    const pending = sourcingItems.filter((i) => !i.approved);
    if (pending.length === 0) return;
    const item = pending[Math.min(materialIndex, pending.length - 1)];
    toggleApproveItem(item.id);
    if (materialIndex < pending.length - 1) setMaterialIndex(materialIndex + 1);
  };

  const generateLaborFromMaterials = () => {
    const approved = sourcingItems.filter((i) => i.approved);
    const tasks = laborTasksFromSourcing(approved);
    setLaborTasks(tasks);
    Alert.alert('Scope ready', `${tasks.length} labor tasks created.`);
  };

  const buildSchedule = () => {
    if (laborTasks.length === 0) return;
    generateSchedule(laborTasks);
    setHasScheduleBuilt(true);
    Alert.alert('Schedule built', 'Your day-by-day labor plan is ready.');
  };

  const renderStepBody = () => {
    switch (stepId) {
      case 'welcome':
        return (
          <TextInput
            testID="guided-project-name"
            value={projectName}
            onChangeText={(name) => currentProjectId && renameProject(currentProjectId, name)}
            placeholder="e.g. Oak Street Kitchen"
            style={[styles.input, { borderColor: t.colors.border, color: t.colors.text }]}
          />
        );

      case 'capture_photo':
        return (
          <View>
            {baseImage ? (
              <ElegantImage uri={baseImage} label="Your photo" caption="Starting point for AI" />
            ) : (
              <View style={[styles.placeholder, { borderColor: t.colors.border }]}>
                <Text style={{ color: t.colors.textMuted }}>No photo yet</Text>
              </View>
            )}
            <PrimaryButton title="Take or upload photo" onPress={() => setShowCamera(true)} />
            <SecondaryButton title="Use example house" onPress={loadExample} style={{ marginTop: 8 }} />
          </View>
        );

      case 'describe_vision':
        return (
          <TextInput
            testID="guided-prompt"
            value={prompt}
            onChangeText={setDesignPrompt}
            multiline
            numberOfLines={4}
            placeholder="Bright modern kitchen with natural materials and better flow"
            style={[styles.input, styles.textArea, { borderColor: t.colors.border, color: t.colors.text }]}
          />
        );

      case 'pick_style':
        return (
          <OptionGrid
            options={STYLE_OPTIONS}
            selected={tweaks.style}
            onSelect={(v) => setDesignTweaks({ ...tweaks, style: v })}
          />
        );
      case 'pick_palette':
        return (
          <OptionGrid
            options={PALETTE_OPTIONS}
            selected={tweaks.colorPalette}
            onSelect={(v) => setDesignTweaks({ ...tweaks, colorPalette: v })}
          />
        );
      case 'pick_layout':
        return (
          <OptionGrid
            options={LAYOUT_OPTIONS}
            selected={tweaks.layout}
            onSelect={(v) => setDesignTweaks({ ...tweaks, layout: v })}
          />
        );

      case 'review_design':
        return (
          <View>
            {baseImage && versions.length > 0 ? (
              <BeforeAfterSlider
                before={baseImage}
                after={versions[versions.length - 1].imageUri}
                height={280}
                idleAnimate
                showHint={false}
                style={{ marginBottom: 8 }}
              />
            ) : (
              <ElegantImage uri={baseImage || '/test-images/before-after/before-1.jpg'} label="Before" />
            )}
            {!versions.length && (
              <PrimaryButton
                title={isGenerating ? 'Generating…' : 'Generate AI concept'}
                onPress={generateDesign}
                disabled={isGenerating}
              />
            )}
            {isGenerating && <ActivityIndicator color={t.colors.accent} style={{ marginTop: 12 }} />}
          </View>
        );

      case 'approve_design': {
        const v = versions[versions.length - 1];
        if (!v) return <Text style={{ color: t.colors.textMuted }}>Generate a design first.</Text>;
        return (
          <View>
            <ElegantImage uri={v.imageUri} label="Proposed" caption={v.prompt} />
            <ReadyToGoCostPill total={4500} materials={2800} labor={1700} hours={68} />
            <PrimaryButton title="Approve & add materials" onPress={() => approveAndSource(v)} style={{ marginTop: 12 }} />
          </View>
        );
      }

      case 'review_sourcing':
        return (
          <View>
            <Text style={[styles.listHint, { color: t.colors.textSecondary }]}>
              {sourcingItems.length} items from Lowe&apos;s, Amazon, and Home Depot
            </Text>
            {sourcingItems.slice(0, 4).map((item) => (
              <View key={item.id} style={[styles.itemRow, { borderColor: t.colors.border }]}>
                <Text style={{ color: t.colors.text, fontWeight: '600', flex: 1 }}>{item.name}</Text>
                <Text style={{ color: t.colors.textSecondary }}>${item.price}</Text>
              </View>
            ))}
          </View>
        );

      case 'approve_materials': {
        const pending = sourcingItems.filter((i) => !i.approved);
        const current = pending[0];
        if (!current) {
          return <Text style={{ color: t.colors.success, fontWeight: '700' }}>All materials approved.</Text>;
        }
        return (
          <View>
            <Text style={[styles.oneAtATime, { color: t.colors.textMuted }]}>
              Item {sourcingItems.filter((i) => i.approved).length + 1} of {sourcingItems.length}
            </Text>
            <View style={[styles.itemCard, { borderColor: t.colors.border, backgroundColor: t.colors.surfaceAlt }]}>
              <Text style={[styles.itemName, { color: t.colors.text }]}>{current.name}</Text>
              <Text style={{ color: t.colors.textSecondary }}>{current.retailer}</Text>
              <Text style={[styles.itemPrice, { color: t.colors.accent }]}>
                ${(current.price * current.quantity).toLocaleString()}
              </Text>
            </View>
            <PrimaryButton title="Approve this item" onPress={approveCurrentMaterial} />
          </View>
        );
      }

      case 'confirm_scope':
        return (
          <View>
            {laborTasks.length === 0 ? (
              <PrimaryButton title="Generate labor tasks from materials" onPress={generateLaborFromMaterials} />
            ) : (
              laborTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleScopeItem(task.id)}
                  style={[styles.itemRow, { borderColor: t.colors.border }]}
                >
                  <Text style={{ color: scopeCompleted[task.id] ? t.colors.success : t.colors.text }}>
                    {scopeCompleted[task.id] ? '✓ ' : '○ '}
                    {task.name} ({task.estimatedHours}h)
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case 'build_schedule':
        return (
          <View>
            {hasScheduleBuilt ? (
              <Text style={{ color: t.colors.success, fontWeight: '700' }}>
                Schedule generated for {laborTasks.length} tasks across 8-hour days with breaks.
              </Text>
            ) : (
              <PrimaryButton title="Build schedule" onPress={buildSchedule} />
            )}
          </View>
        );

      case 'project_complete':
        return (
          <View>
            <ElegantImage
              uri={approvedDesign?.imageUri || versions[0]?.imageUri || '/test-images/before-after/after-1.jpg'}
              label="Finished"
              caption="Design → Sourcing → Scope → Schedule"
            />
            <Text style={[styles.doneText, { color: t.colors.text }]}>
              Your remodel plan is ready. Review the overview anytime for flags on areas that change.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.shell} testID="guided-process-screen">
      <MilkyBackdrop />

      <View style={[styles.topBar, milkyFill('header', 'rgba(255,255,255,0.9)')]}>
        <ConstrainedView style={styles.topInner}>
          <TouchableOpacity onPress={() => navigation.navigate('ProjectProgress')} testID="guided-progress-link">
            <Text style={styles.progressLink}>
              Overview {attentionCount > 0 ? `(${attentionCount} flagged)` : ''}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.stepCounter, { color: MILKY_INK_SOFT }]}>
            Step {meta.stepIndex} of {meta.totalSteps}
          </Text>
        </ConstrainedView>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, milkyFill('progress', '#C4B5FD'), { width: `${progressPct}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        <ConstrainedView style={styles.bodyInner}>
          <GuidedStepCard>
            <Text style={styles.phase}>{meta.title}</Text>
            <Text style={[styles.question, { color: t.colors.text }]}>{meta.question}</Text>
            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>{meta.subtitle}</Text>
            {renderStepBody()}
          </GuidedStepCard>
        </ConstrainedView>
      </ScrollView>

      <View style={[styles.footer, milkyFill('footer', 'rgba(255,255,255,0.95)')]}>
        <ConstrainedView style={styles.footerInner}>
          <SecondaryButton title="Back" onPress={goBack} disabled={!getPreviousStep(stepId)} />
          <PrimaryButton
            title={stepId === 'project_complete' ? 'View overview' : 'Continue'}
            onPress={stepId === 'project_complete' ? () => navigation.navigate('ProjectProgress') : goNext}
            disabled={!canContinue && stepId !== 'project_complete'}
            style={{ flex: 1, marginLeft: 12 }}
          />
        </ConstrainedView>
        <TouchableOpacity onPress={resumeRecommended} style={styles.resumeLink}>
          <Text style={{ color: MILKY_INK_SOFT, fontSize: 12 }}>Resume where I left off</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCamera} animationType="slide">
        <CameraScreen onPhotoTaken={handlePhoto} onCancel={() => setShowCamera(false)} />
      </Modal>
    </View>
  );
}

function OptionGrid({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.optionGrid}>
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            testID={`guided-option-${opt.replace(/\s+/g, '-')}`}
            onPress={() => onSelect(opt)}
            style={[
              styles.optionChip,
              active ? milkyFill('chipActive', '#EDE9FE') : { backgroundColor: 'rgba(255,255,255,0.7)' },
              { borderColor: active ? '#C4B5FD' : t.colors.border },
            ]}
          >
            <Text style={{ color: active ? MILKY_INK : t.colors.text, fontWeight: active ? '700' : '500' }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0, position: 'relative' },
  topBar: { borderBottomWidth: 1, borderBottomColor: 'rgba(180, 160, 210, 0.25)', paddingTop: 8, zIndex: 2 },
  topInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  progressLink: { fontSize: 14, fontWeight: '700', color: MILKY_INK },
  stepCounter: { fontSize: 12, fontWeight: '600' },
  progressTrack: {
    height: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  body: { flex: 1, zIndex: 1 },
  bodyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    minHeight: '72%',
  } as any,
  bodyInner: { alignItems: 'center', width: '100%' },
  phase: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: MILKY_INK_SOFT,
    textAlign: 'center',
  },
  question: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: { fontSize: 15, marginTop: 10, marginBottom: 20, lineHeight: 22, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  placeholder: {
    height: 200,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  listHint: { marginBottom: 12, fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  oneAtATime: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  itemCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 16 },
  itemName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  itemPrice: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  doneText: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  footer: { borderTopWidth: 1, borderTopColor: 'rgba(180, 160, 210, 0.25)', paddingVertical: 14, paddingHorizontal: 16, zIndex: 2 },
  footerInner: { flexDirection: 'row', alignItems: 'center' },
  resumeLink: { alignItems: 'center', marginTop: 8 },
});