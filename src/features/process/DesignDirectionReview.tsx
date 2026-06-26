import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme, PrimaryButton, SecondaryButton } from '../../shared';
import ElegantImage from '../../shared/ElegantImage';
import type { DesignVersion } from '../design/types';

interface DesignDirectionReviewProps {
  concepts: [DesignVersion | null, DesignVersion | null];
  selectedSlot: 0 | 1 | null;
  onSelectSlot: (slot: 0 | 1) => void;
  isGenerating: boolean;
  onGeneratePair: () => void;
  onRegenerateBoth: () => void;
  onRegenerateOther: () => void;
}

export default function DesignDirectionReview({
  concepts,
  selectedSlot,
  onSelectSlot,
  isGenerating,
  onGeneratePair,
  onRegenerateBoth,
  onRegenerateOther,
}: DesignDirectionReviewProps) {
  const t = useTheme();
  const hasPair = !!(concepts[0] && concepts[1]);
  const labels: [string, string] = ['Direction A', 'Direction B'];

  const renderSlot = (slot: 0 | 1) => {
    const concept = concepts[slot];
    const selected = selectedSlot === slot;

    if (!concept) {
      return (
        <View
          style={[
            styles.slot,
            styles.placeholder,
            { borderColor: t.colors.border, backgroundColor: t.colors.surfaceAlt },
          ]}
        >
          <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>Waiting for concept…</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        testID={slot === 0 ? 'guided-concept-a' : 'guided-concept-b'}
        accessibilityLabel={`${labels[slot]}${selected ? ', selected' : ''}`}
        accessibilityRole="button"
        onPress={() => onSelectSlot(slot)}
        activeOpacity={0.9}
        style={[
          styles.slot,
          styles.selectable,
          {
            borderColor: selected ? t.colors.accent : t.colors.border,
            backgroundColor: selected ? 'rgba(255, 56, 92, 0.06)' : t.colors.surfaceAlt,
          },
        ]}
      >
        <ElegantImage
          uri={concept.imageUri}
          label={labels[slot]}
          style={styles.imageCard}
          aspectRatio={4 / 5}
        />
        {selected ? (
          <View style={[styles.selectedBadge, { backgroundColor: t.colors.accent }]}>
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        ) : (
          <Text style={[styles.tapHint, { color: t.colors.textMuted }]}>Tap to select</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.pairRow}>
        {renderSlot(0)}
        {renderSlot(1)}
      </View>

      {!hasPair && !isGenerating ? (
        <PrimaryButton
          testID="guided-generate-directions"
          title="Generate two directions"
          onPress={onGeneratePair}
          disabled={isGenerating}
        />
      ) : null}

      {hasPair ? (
        <View style={styles.actions}>
          <SecondaryButton
            testID="guided-regenerate-both"
            title={isGenerating ? 'Regenerating…' : 'Regenerate both'}
            onPress={onRegenerateBoth}
            disabled={isGenerating}
          />
          <PrimaryButton
            testID="guided-regenerate-other"
            title={isGenerating ? 'Regenerating…' : 'Regenerate other'}
            onPress={onRegenerateOther}
            disabled={isGenerating || selectedSlot === null}
            style={{ marginTop: 8 }}
          />
        </View>
      ) : null}

      {hasPair && selectedSlot === null ? (
        <Text style={[styles.hint, { color: t.colors.textSecondary }]}>
          Select the direction you prefer, then regenerate the other — or regenerate both.
        </Text>
      ) : null}

      {isGenerating ? <ActivityIndicator color={t.colors.accent} style={{ marginTop: 12 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pairRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  slot: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  selectable: {
    paddingBottom: 8,
  },
  placeholder: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  imageCard: {
    marginVertical: 0,
    borderWidth: 0,
  },
  selectedBadge: {
    alignSelf: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 6,
  },
  actions: {
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
});