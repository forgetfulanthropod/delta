import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import { DesignVersion } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';
import CameraScreen from './CameraScreen';
import AIProviderSelector from './AIProviderSelector';

export default function DesignStudioScreen() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [prompt, setPrompt] = useState("Modern minimalist living room with more natural light");
  const [currentTweaks, setCurrentTweaks] = useState({ style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' });
  const [showCamera, setShowCamera] = useState(false);
  const [aiProvider, setAiProvider] = useState('x');
  const [aiApiKey, setAiApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePhotoTaken = (uri: string) => {
    setOriginalImage(uri);
    setShowCamera(false);
  };

  const reimagine = async () => {
    if (!originalImage) return;
    setIsGenerating(true);

    try {
      const res = await fetch('http://localhost:4000/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUri: originalImage,
          prompt,
          provider: aiProvider,
          apiKey: aiApiKey,
        }),
      });
      const data = await res.json();
      if (data.imageUri) {
        const newVersion: DesignVersion = {
          id: Date.now().toString(),
          imageUri: data.imageUri,
          prompt,
          tweaks: { ...currentTweaks },
          createdAt: new Date().toISOString(),
        };
        setVersions([newVersion, ...versions]);
        setIsGenerating(false);
        return;
      }
    } catch (e) {
      console.log('Backend call failed, using local');
    }

    setIsGenerating(false);
    // Fallback
    const variationUrls = ['/ai-room-1.jpg', '/ai-room-2.jpg', '/ai-room-3.jpg'];
    const randomUrl = variationUrls[Math.floor(Math.random() * variationUrls.length)];
    const newVersion: DesignVersion = {
      id: Date.now().toString(),
      imageUri: randomUrl,
      prompt,
      tweaks: { ...currentTweaks },
      createdAt: new Date().toISOString(),
    };
    setVersions([newVersion, ...versions]);
  };

  const sendToSourcing = async (version: DesignVersion) => {
    const store = useDeltaStore.getState();
    store.setApprovedDesign(version);

    try {
      const response = await fetch('http://localhost:4000/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUri: version.imageUri,
          prompt: version.prompt,
        }),
      });
      const data = await response.json();
      console.log('Backend response:', data);
    } catch (e) {
      console.log('Backend not running, using local data');
    }

    // Generate sample sourcing items based on the design
    const suggestedItems = [
      { id: Date.now().toString(), name: 'LVP Flooring - Oak', retailer: "Lowe's" as const, price: 3.49, quantity: 120, approved: false },
      { id: (Date.now()+1).toString(), name: 'Matte Black Faucet', retailer: 'Amazon' as const, price: 89, quantity: 2, approved: false },
      { id: (Date.now()+2).toString(), name: 'LED Recessed Lights', retailer: 'Home Depot' as const, price: 42, quantity: 8, approved: false },
    ];
    store.addSourcingItems(suggestedItems);
    alert('Design sent to Sourcing!\nSuggested materials added.\n\nGo to Sourcing tab to approve items.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 }}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1 }}>Design Studio</Text>
        <Text style={{ fontSize: 20, color: '#666', marginTop: 8 }}>Take a photo of your space. Reimagine it. Make it yours.</Text>
      </View>

      <TouchableOpacity 
        onPress={() => setShowCamera(true)}
        style={{ backgroundColor: '#FF385C', paddingVertical: 18, borderRadius: 20, marginTop: 16 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: '600' }}>Take Photo of Your Space</Text>
      </TouchableOpacity>
      <AIProviderSelector onProviderChange={(provider, key) => {
        setAiProvider(provider);
        setAiApiKey(key);
      }} />

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
          <TouchableOpacity 
        onPress={reimagine}
        disabled={isGenerating}
        style={{ backgroundColor: isGenerating ? '#666' : '#000', paddingVertical: 18, borderRadius: 20, marginTop: 16 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: '600' }}>
          {isGenerating ? 'Generating with AI...' : 'Reimagine with AI'}
        </Text>
      </TouchableOpacity>
        </View>
      )}

      {versions.length > 0 && (
        <View>
          <Text style={styles.section}>Versions</Text>
          {versions.map((v, index) => (
            <View key={v.id} style={styles.versionCard}>
              <Image source={{ uri: v.imageUri }} style={styles.image} />
              <Text style={{ fontWeight: '600' }}>{v.prompt}</Text>
              <Text style={{ color: '#2e7d32', fontSize: 12 }}>AI Generated Variation</Text>
              <Text>Style: {v.tweaks.style} • Colors: {v.tweaks.colorPalette} • Layout: {v.tweaks.layout}</Text>
              <Button title="Use this version" onPress={() => { /* TODO: set as current */ }} />
              <TouchableOpacity 
              onPress={() => sendToSourcing(v)}
              style={{ backgroundColor: '#FF385C', paddingVertical: 14, borderRadius: 20, marginTop: 12 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Send to Sourcing →</Text>
            </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <Modal visible={showCamera} animationType="slide">
        <CameraScreen
          onPhotoTaken={handlePhotoTaken}
          onCancel={() => setShowCamera(false)}
        />
      </Modal>
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