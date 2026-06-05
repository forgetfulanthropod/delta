import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {/* Energetic, colored header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Delta</Text>
          <Text style={styles.headline}>
            Focus energy on changing{'\n'}the built environment.
          </Text>
          <Text style={styles.subhead}>
            AI that turns vision into real transformation of the spaces we live and work in.
          </Text>
        </View>

        {/* Visual proof of the transformation process */}
        <View style={styles.visualSection}>
          <View style={styles.visualRow}>
            <View style={styles.visualWrapper}>
              <Image
                source={{ uri: '/test-images/before-after/before-1.jpg' }}
                style={styles.visualImage}
                resizeMode="cover"
              />
              <Text style={styles.visualLabel}>Before</Text>
            </View>

            <Text style={styles.visualArrow}>→</Text>

            <View style={styles.visualWrapper}>
              <Image
                source={{ uri: '/test-images/before-after/after-1.jpg' }}
                style={styles.visualImage}
                resizeMode="cover"
              />
              <Text style={styles.visualLabel}>After</Text>
            </View>
          </View>
          <Text style={styles.visualCaption}>Real change, powered by AI</Text>
        </View>

        <Text style={styles.choiceTitle}>How do you want to shape the change?</Text>

        {/* Owner card - vibrant and action-oriented */}
        <TouchableOpacity
          style={[styles.card, styles.ownerCard]}
          onPress={() => onSelectRole('owner')}
          activeOpacity={0.9}
        >
          <Text style={styles.cardTitleLight}>I have a space to transform</Text>
          <Text style={styles.cardDescLight}>
            Capture it. Let AI reveal what's possible. Source materials and make it real.
          </Text>
          <Text style={styles.cardCta}>Start remodeling →</Text>
        </TouchableOpacity>

        {/* Worker card - energetic builder focus */}
        <TouchableOpacity
          style={[styles.card, styles.workerCard]}
          onPress={() => onSelectRole('worker')}
          activeOpacity={0.9}
        >
          <Text style={styles.cardTitleLight}>I want to build the transformation</Text>
          <Text style={styles.cardDescLight}>
            Join real projects reshaping buildings and spaces. $25 an hour guaranteed.
          </Text>
          <Text style={styles.cardCta}>Join the work →</Text>
        </TouchableOpacity>

        {/* Process focus line - brings attention to the act of changing */}
        <View style={styles.process}>
          <Text style={styles.processText}>
            Capture  →  AI Reimagine  →  Source  →  Schedule  →  New Reality
          </Text>
        </View>
      </View>
    </View>
  );
}

const ACCENT = '#FF385C';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF5F7', // soft energetic tint
  },
  content: {
    flex: 1,
    maxWidth: 620,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -2.5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 34,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 16,
    color: '#444',
    marginTop: 10,
    lineHeight: 22,
  },
  visualSection: {
    marginVertical: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E6E8',
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visualWrapper: {
    width: '42%',
    position: 'relative',
  },
  visualImage: {
    width: '100%',
    height: 92,
    borderRadius: 10,
  },
  visualLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  visualArrow: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: '700',
  },
  visualCaption: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ownerCard: {
    backgroundColor: ACCENT,
  },
  workerCard: {
    backgroundColor: '#1F1F2E',
  },
  cardTitleLight: {
    fontSize: 19,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  cardDescLight: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    marginBottom: 14,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    opacity: 0.95,
  },
  process: {
    marginTop: 28,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F0E6E8',
  },
  processText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    letterSpacing: 0.5,
  },
});