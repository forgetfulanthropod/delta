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

  const handlePhotoTaken = (uri: string) => {
    setOriginalImage(uri);
    setShowCamera(false);
  };

  const reimagine = async () => {
    if (!originalImage) return;

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
        return;
      }
    } catch (e) {
      console.log('Backend call failed, using local');
    }

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
    <ScrollView style={styles.container} className="bg-white">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-4xl font-semibold text-[#222] tracking-tight">Design Studio</Text>
        <Text className="text-xl text-[#666] mt-2">Take a photo of your space. Reimagine it. Make it yours.</Text>
      </View>

      <TouchableOpacity 
        onPress={() => setShowCamera(true)}
        className="bg-[#FF385C] py-4 rounded-2xl active:bg-[#E31C5F]">
        <Text className="text-white text-center text-xl font-semibold tracking-tight">Take Photo of Your Space</Text>
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
        className="mt-4 bg-black py-4 rounded-2xl active:bg-[#222]">
        <Text className="text-white text-center text-xl font-semibold tracking-tight">Reimagine with AI</Text>
      </TouchableOpacity>
        </View>
      )}

      {versions.length > 0 && (
        <View>
          <Text style={styles.section}>Versions</Text>
          {versions.map((v, index) => (
            <View key={v.id} style={styles.versionCard} className="bg-[#FAFAFA] border border-[#F0F0F0] shadow-sm">
              <Image source={{ uri: v.imageUri }} style={styles.image} />
              <Text style={{ fontWeight: '600' }}>{v.prompt}</Text>
              <Text style={{ color: '#2e7d32', fontSize: 12 }}>AI Generated Variation</Text>
              <Text>Style: {v.tweaks.style} • Colors: {v.tweaks.colorPalette} • Layout: {v.tweaks.layout}</Text>
              <Button title="Use this version" onPress={() => { /* TODO: set as current */ }} />
              <TouchableOpacity 
              onPress={() => sendToSourcing(v)}
              className="mt-3 bg-[#FF385C] py-3 rounded-2xl active:bg-[#E31C5F]">
              <Text className="text-white text-center font-semibold text-lg">Send to Sourcing →</Text>
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