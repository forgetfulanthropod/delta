import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {/* Minimal top branding */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>Delta</Text>
          <Text style={styles.tagline}>Transforming the built environment</Text>
        </View>

        {/* Giant before & after slider - the main focus of the landing page */}
        <View style={styles.heroSliderWrapper}>
          <BeforeAfterSlider
            before="/test-images/before-after/before-1.jpg"
            after="/test-images/before-after/after-1.jpg"
            height={420}
            idleAnimate={true}
          />
          <View style={styles.clickHint}>
            <Text style={styles.clickHintText}>Drag the center line</Text>
          </View>
        </View>

        {/* Large semitransparent action buttons below the slider */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.ownerAction]}
            onPress={() => onSelectRole('owner')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>Remodel my space</Text>
            <Text style={styles.actionSubtitle}>Reimagine with AI • Make it real</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.workerAction]}
            onPress={() => onSelectRole('worker')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>Work on spaces</Text>
            <Text style={styles.actionSubtitle}>Get paid $25 an hour guaranteed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const ACCENT = '#FF385C';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0F12', // dark for dramatic giant slider
  },
  content: {
    flex: 1,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  heroSliderWrapper: {
    flex: 1,
    minHeight: 380,
    backgroundColor: '#000',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    position: 'relative',
  },
  clickHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -10 }],
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    pointerEvents: 'none',
  },
  clickHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAction: {
    backgroundColor: 'rgba(255, 56, 92, 0.15)',
    borderColor: 'rgba(255, 56, 92, 0.4)',
  },
  workerAction: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  bottomHint: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
});