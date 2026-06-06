import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from './theme';
import { getImageSource } from './media';

interface ProjectHeroProps {
  imageUri: string | null | undefined;
  label?: string;
  prompt?: string;
  tweaks?: { style?: string; colorPalette?: string; layout?: string };
  style?: any;
  imageStyle?: any;
}

/**
 * Extracted ProjectHero / selected design hero pattern (Phase 1).
 * Used in ScopingScreen (selected design hero first) and DesignStudioScreen (current/selected photo hero).
 * Consistent URI handling via media util. Theme-aware container.
 * Builds on existing RN Image + good state carousels/heroes. No breaking changes.
 */
export default function ProjectHero({
  imageUri,
  label = 'SELECTED DESIGN',
  prompt,
  tweaks,
  style,
  imageStyle,
}: ProjectHeroProps) {
  const t = useTheme();
  const styles = createStyles(t);

  const src = getImageSource(imageUri);

  if (!imageUri) {
    return (
      <View style={[styles.empty, style]}>
        <Text style={styles.emptyText}>No selected design image</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View style={styles.imageWrap}>
        <Image
          source={src}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </View>
      {prompt ? (
        <Text style={styles.prompt} numberOfLines={2}>{prompt}</Text>
      ) : null}
      {tweaks ? (
        <Text style={styles.meta}>
          {tweaks.style} • {tweaks.colorPalette} • {tweaks.layout}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(t: any) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.success,
      marginBottom: 6,
    },
    imageWrap: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: t.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    image: {
      width: '100%',
      height: 220,
      backgroundColor: t.colors.surfaceAlt,
    },
    prompt: {
      fontSize: 15,
      fontWeight: '600',
      color: t.colors.text,
      marginTop: 6,
    },
    meta: {
      color: t.colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    empty: {
      backgroundColor: t.colors.cardBg,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: t.colors.border,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: t.colors.text,
    },
  });
}
