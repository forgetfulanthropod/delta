import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, ScrollView, TextInput } from 'react-native';
import { DesignVersion } from './types';

export default function DesignStudioScreen() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [prompt, setPrompt] = useState("Modern minimalist living room with more natural light");
  const [currentTweaks, setCurrentTweaks] = useState({ style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' });

  const takePhoto = () => {
    // TODO: integrate react-native-vision-camera
    const fakeUri = 'https://picsum.photos/seed/room/600/400';
    setOriginalImage(fakeUri);
  };

  const reimagine = () => {
    if (!originalImage) return;

    const newVersion: DesignVersion = {
      id: Date.now().toString(),
      imageUri: `https://picsum.photos/seed/${Date.now()}/600/400`,
      prompt,
      tweaks: { ...currentTweaks },
      createdAt: new Date().toISOString(),
    };
    setVersions([newVersion, ...versions]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Design Studio (Goal #1)</Text>
      <Text style={styles.subtitle}>Take photo → Reimagine → Tweak until perfect</Text>

      <Button title="📸 Take / Upload Photo" onPress={takePhoto} />

      {originalImage && (
        <View style={{ marginVertical: 12 }}>
          <Image source={{ uri: originalImage }} style={styles.image} />
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe your vision..."
            multiline
          />
          <Button title="✨ Reimagine with AI" onPress={reimagine} />
        </View>
      )}

      {versions.length > 0 && (
        <View>
          <Text style={styles.section}>Versions</Text>
          {versions.map((v, index) => (
            <View key={v.id} style={styles.versionCard}>
              <Image source={{ uri: v.imageUri }} style={styles.image} />
              <Text style={{ fontWeight: '600' }}>{v.prompt}</Text>
              <Text>Style: {v.tweaks.style} • Colors: {v.tweaks.colorPalette} • Layout: {v.tweaks.layout}</Text>
              <Button title="Use this version" onPress={() => { /* TODO: set as current */ }} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 12 },
  image: { width: '100%', height: 220, borderRadius: 8, marginVertical: 8 },
  promptInput: { borderWidth: 1, padding: 10, marginVertical: 8, height: 60 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  versionCard: { backgroundColor: '#f5f5f5', padding: 12, marginBottom: 12, borderRadius: 8 },
});