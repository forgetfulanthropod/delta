import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.screen}>
      {/* Full screen before/after slider as background */}
      <View style={styles.sliderBackground}>
        <BeforeAfterSlider
          before="/test-images/before-after/before-1.jpg"
          after="/test-images/before-after/after-1.jpg"
          height={screenHeight}
          idleAnimate={true}
          showHint={false}
        />
      </View>

      {/* Semitransparent UI overlayed on top */}
      <View style={styles.overlay}>
        {/* Top branding bar - semitransparent */}
        <View style={styles.topBar}>
          <View style={styles.constrained}>
            <Text style={styles.logo}>Delta</Text>
            <Text style={styles.tagline}>Transforming the built environment</Text>
          </View>
        </View>

        {/* Spacer to push bottom UI down */}
        <View style={{ flex: 1 }} />

        {/* Bottom action buttons - large, semitransparent, overlayed */}
        <View style={styles.bottomBar}>
          <View style={styles.constrained}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.ownerAction]}
                onPress={() => onSelectRole('owner')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionTitle}>Remodel my space</Text>
                <Text style={styles.actionSubtitle}>Reimagine with AI • Make it real</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.workerAction]}
                onPress={() => onSelectRole('worker')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionTitle}>Work on spaces</Text>
                <Text style={styles.actionSubtitle}>Get paid $25 an hour guaranteed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const ACCENT = '#FF385C';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000', // full bleed dark
  },
  // Full screen slider background
  sliderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  // Overlay container for all UI on top of the full screen slider
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  // Top semitransparent bar
  topBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 48,
    paddingBottom: 12,
  },
  // Bottom semitransparent bar
  bottomBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 12,
    paddingBottom: 40,
  },
  // Constrain UI width for readability, centered
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAction: {
    backgroundColor: 'rgba(255, 56, 92, 0.25)',
    borderColor: 'rgba(255, 56, 92, 0.5)',
  },
  workerAction: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});