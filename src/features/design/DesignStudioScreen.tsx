import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, Modal, TouchableOpacity, Button, Alert } from 'react-native';
import { DesignVersion } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';
import CameraScreen from './CameraScreen';

export default function DesignStudioScreen() {
  // Project workspace state (focused on ONE house)
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isExample, setIsExample] = useState(false);

  const [prompt, setPrompt] = useState('Bright modern kitchen with natural materials and better flow');
  const [currentTweaks, setCurrentTweaks] = useState({ style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' });
  const [showCamera, setShowCamera] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Replaced clunky API key UI with clean "login" simulation
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);

  const { approvedDesign, setApprovedDesign, sourcingItems, laborTasks, clearSourcing, addSourcingItems, setLaborTasks } = useDeltaStore();

  const providerLabel = (id: string) => {
    if (id === 'x') return 'X (Grok)';
    if (id === 'google') return 'Google';
    if (id === 'anthropic') return 'Anthropic';
    return 'OpenAI';
  };

  const handleLogin = (provider: string) => {
    setConnectedProvider(provider);
    Alert.alert('Connected', `Logged in with ${providerLabel(provider)}. AI generation enabled.`);
  };

  const handlePhotoTaken = (uri: string) => {
    if (!baseImage) {
      // Starting a fresh new project
      setBaseImage(uri);
      setProjectPhotos([uri]);
      setProjectName('My New Project');
      setVersions([]);
      setIsExample(false);
      setPrompt('Bright modern kitchen with natural materials and better flow');
    } else {
      // Adding reference / progress photo to existing project
      setProjectPhotos((prev) => [...prev, uri]);
    }
    setShowCamera(false);
  };

  const loadExampleProject = () => {
    const base = '/test-images/before-after/before-1.jpg';
    setBaseImage(base);
    setProjectName('The Oak Street House');
    setIsExample(true);

    // Photos & AI concepts for ONE house (before/after of the same property + AI reimaginings of its rooms)
    // Using only the most consistent assets so it actually reads as a single project/home
    const photos = [
      base,
      '/test-images/before-after/after-1.jpg',
      '/ai-room-1.jpg',
      '/ai-room-2.jpg',
      '/ai-room-3.jpg',
    ];
    setProjectPhotos(photos);

    // Pre-populated AI variations for this house (different rooms / directions)
    const exVersions: DesignVersion[] = [
      {
        id: 'ex-v1',
        imageUri: '/ai-room-1.jpg',
        prompt: 'Modern minimalist kitchen with warm oak, huge island, and tons of natural light',
        tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ex-v2',
        imageUri: '/ai-room-2.jpg',
        prompt: 'Rustic yet refined living room, cozy fireplace, built-ins, earthy tones',
        tweaks: { style: 'Rustic', colorPalette: 'Earthy', layout: 'Cozy nooks' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ex-v3',
        imageUri: '/test-images/before-after/after-1.jpg',
        prompt: 'Bright open-plan family room with large windows and clean lines',
        tweaks: { style: 'Minimal', colorPalette: 'Warm neutrals', layout: 'Open plan' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ex-v4',
        imageUri: '/ai-room-3.jpg',
        prompt: 'Industrial chic primary bath, concrete + warm wood, statement lighting',
        tweaks: { style: 'Industrial', colorPalette: 'Bold colors', layout: 'Multi-zone' },
        createdAt: new Date().toISOString(),
      },
    ];
    setVersions(exVersions);

    // Seed the global store so Sourcing + Labor tabs have real "in progress" data for this house
    const store = useDeltaStore.getState();
    store.clearSourcing();

    const baseTs = Date.now();
    const demoSourcing = [
      { id: String(baseTs), name: 'White Oak Engineered Flooring', retailer: "Lowe's" as const, price: 7.89, quantity: 380, approved: true, url: 'https://www.lowes.com' },
      { id: String(baseTs + 1), name: 'Matte Black Cabinet Hardware (30pc)', retailer: 'Amazon' as const, price: 68, quantity: 1, approved: true, url: 'https://www.amazon.com' },
      { id: String(baseTs + 2), name: 'LED 6" Recessed Lights (12-pack)', retailer: 'Home Depot' as const, price: 89, quantity: 2, approved: true, url: 'https://www.homedepot.com' },
      { id: String(baseTs + 3), name: 'Quartz Countertop - Calacatta Laza', retailer: "Lowe's" as const, price: 62, quantity: 42, approved: false, url: 'https://www.lowes.com' },
      { id: String(baseTs + 4), name: 'Farmhouse Apron Sink', retailer: 'Amazon' as const, price: 420, quantity: 1, approved: true, url: 'https://www.amazon.com' },
      { id: String(baseTs + 5), name: 'Matte Black Pull-Down Faucet', retailer: 'Home Depot' as const, price: 179, quantity: 2, approved: false, url: 'https://www.homedepot.com' },
      { id: String(baseTs + 6), name: 'Interior Paint - Warm White (5 gal)', retailer: "Lowe's" as const, price: 48, quantity: 3, approved: true, url: 'https://www.lowes.com' },
      { id: String(baseTs + 7), name: 'Custom Closet System Hardware', retailer: 'Home Depot' as const, price: 215, quantity: 1, approved: false, url: 'https://www.homedepot.com' },
    ];
    store.addSourcingItems(demoSourcing);

    const demoTasks = [
      { id: 'lt1', name: 'Demo kitchen + bath', estimatedHours: 14, category: 'demo' },
      { id: 'lt2', name: 'Rough electrical + lighting', estimatedHours: 9, category: 'electrical' },
      { id: 'lt3', name: 'Install flooring throughout', estimatedHours: 11, category: 'flooring' },
      { id: 'lt4', name: 'Paint all walls + trim', estimatedHours: 7, category: 'painting' },
      { id: 'lt5', name: 'Install cabinets, counters, fixtures', estimatedHours: 12, category: 'finish' },
    ];
    store.setLaborTasks(demoTasks);

    // Pick a strong version as the current approved design
    store.setApprovedDesign(exVersions[0]);

    setPrompt('Bright modern kitchen with natural materials and better flow');
    Alert.alert('Example Loaded', 'The Oak Street House is now active.\n\nSourcing has 8 items (some already approved).\nLabor tasks are ready.\nCheck the Sourcing and Labor tabs for the full breakout.');
  };

  const startNewProject = () => {
    // Opens camera/upload for a clean start
    setShowCamera(true);
  };

  const resetToChooser = () => {
    setBaseImage(null);
    setProjectPhotos([]);
    setVersions([]);
    setProjectName('');
    setIsExample(false);
    setConnectedProvider(null);
    // Keep store as-is so user can still see previous sourcing/labor if they want, or they can clear from those screens
  };

  const reimagine = async () => {
    if (!baseImage) return;
    if (!connectedProvider) {
      Alert.alert('Connect first', 'Please login with a provider (X, Google, Anthropic, etc.) to generate AI designs.');
      return;
    }
    setIsGenerating(true);

    const enhancedPrompt = `${prompt} (Style: ${currentTweaks.style}; Colors: ${currentTweaks.colorPalette}; Layout: ${currentTweaks.layout})`;

    try {
      const res = await fetch('http://localhost:4000/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUri: baseImage,
          prompt: enhancedPrompt,
          provider: connectedProvider,
          apiKey: `demo-${connectedProvider}`,
        }),
      });
      const data = await res.json();
      if (data.imageUri) {
        const newVersion: DesignVersion = {
          id: Date.now().toString(),
          imageUri: data.imageUri,
          prompt: enhancedPrompt,
          tweaks: { ...currentTweaks },
          createdAt: new Date().toISOString(),
        };
        setVersions((prev) => [newVersion, ...prev]);
        // Also add the new render to the house photo gallery so it feels like part of the project documentation
        setProjectPhotos((prev) => [...prev, data.imageUri]);
        setIsGenerating(false);
        return;
      }
    } catch (e) {
      console.log('Backend call failed, using local demo images');
    }

    setIsGenerating(false);
    // Fallback variations (still tied to this house)
    const variationUrls = ['/ai-room-1.jpg', '/ai-room-2.jpg', '/ai-room-3.jpg', '/test-images/before-after/after-1.jpg'];
    const randomUrl = variationUrls[Math.floor(Math.random() * variationUrls.length)];
    const newVersion: DesignVersion = {
      id: Date.now().toString(),
      imageUri: randomUrl,
      prompt: enhancedPrompt,
      tweaks: { ...currentTweaks },
      createdAt: new Date().toISOString(),
    };
    setVersions((prev) => [newVersion, ...prev]);
    setProjectPhotos((prev) => [...prev, randomUrl]);
  };

  const makeCurrent = (version: DesignVersion) => {
    setApprovedDesign(version);
    Alert.alert('Current Design', 'This version is now your approved design for sourcing & labor.');
  };

  const sendToSourcing = async (version: DesignVersion) => {
    setApprovedDesign(version);

    try {
      await fetch('http://localhost:4000/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUri: version.imageUri, prompt: version.prompt }),
      });
    } catch {}

    // Realistic items for a full-house project (user can approve in Sourcing tab)
    const base = Date.now();
    const suggested = [
      { id: String(base), name: 'LVP Flooring - Oak', retailer: "Lowe's" as const, price: 3.49, quantity: 120, approved: false, url: 'https://www.lowes.com' },
      { id: String(base + 1), name: 'Matte Black Faucet', retailer: 'Amazon' as const, price: 89, quantity: 2, approved: false, url: 'https://www.amazon.com' },
      { id: String(base + 2), name: 'LED Recessed Lights', retailer: 'Home Depot' as const, price: 42, quantity: 8, approved: false, url: 'https://www.homedepot.com' },
    ];
    useDeltaStore.getState().addSourcingItems(suggested);
    Alert.alert('Sent to Sourcing', 'Materials added to the shared list.\n\nSwitch to the Sourcing tab to review, approve, and generate labor.');
  };

  // Initial clean chooser (no clunky keys, no 4-house grid)
  if (!baseImage) {
    return (
      <ScrollView style={styles.container}>
        <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 }}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1 }}>Design Studio</Text>
          <Text style={{ fontSize: 18, color: '#555', marginTop: 8, lineHeight: 24 }}>
            One house. Real photos. AI variations. Then straight into sourcing and scheduling.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <TouchableOpacity
            onPress={startNewProject}
            style={[styles.choiceCard, { backgroundColor: '#111' }]}
          >
            <Text style={styles.choiceTitle}>New Project</Text>
            <Text style={styles.choiceSubtitle}>Upload or take photos of your space. Start clean. Generate variations. Send to sourcing when ready.</Text>
            <Text style={styles.choiceCta}>Take or upload photo →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loadExampleProject}
            style={[styles.choiceCard, { backgroundColor: '#F8F1E9', borderColor: '#E8D5C4', borderWidth: 1 }]}
          >
            <Text style={[styles.choiceTitle, { color: '#222' }]}>Example Project</Text>
            <Text style={[styles.choiceSubtitle, { color: '#444' }]}>
              The Oak Street House — before + after + AI concepts for one home, 4 AI directions explored, sourcing list with approvals in progress, labor tasks ready.
            </Text>
            <Text style={[styles.choiceCta, { color: '#C45C26' }]}>Load full demo →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 24, marginTop: 20 }}>
          <Text style={{ color: '#888', fontSize: 13, textAlign: 'center' }}>
            Everything stays focused on a single project. No scattered houses.
          </Text>
        </View>

        <Modal visible={showCamera} animationType="slide">
          <CameraScreen onPhotoTaken={handlePhotoTaken} onCancel={() => setShowCamera(false)} />
        </Modal>
      </ScrollView>
    );
  }

  // Active project workspace (clean, focused)
  const approvedCount = sourcingItems.filter((i) => i.approved).length;
  const sourcingTotal = sourcingItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <ScrollView style={styles.container}>
      {/* Project header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#222', letterSpacing: -0.5 }}>{projectName}</Text>
          <Text style={{ color: '#666', fontSize: 14 }}>{isExample ? 'Example • full pipeline in progress' : 'Your project'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={resetToChooser} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadExampleProject} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>Example</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero base / current image */}
      {baseImage && (
        <View style={{ paddingHorizontal: 16 }}>
          <Image source={{ uri: baseImage }} style={styles.heroImage} />
        </View>
      )}

      {/* House photo gallery — "a lot of photos of one house" */}
      {projectPhotos.length > 1 && (
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <Text style={styles.section}>
            {isExample ? 'Before, after & AI concepts for this house' : 'Photos of this house'} ({projectPhotos.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {projectPhotos.map((photo, idx) => (
              <TouchableOpacity key={idx} onPress={() => setBaseImage(photo)} style={{ marginRight: 10 }}>
                <Image source={{ uri: photo }} style={styles.thumb} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Tap a photo to use it as the base for new AI generations</Text>
        </View>
      )}

      {/* Clean login buttons instead of API keys */}
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <Text style={styles.section}>AI Generation</Text>

        {!connectedProvider ? (
          <View>
            <Text style={{ color: '#555', marginBottom: 10 }}>Connect an account to generate variations with AI.</Text>
            <View style={styles.loginRow}>
              {['x', 'google', 'anthropic', 'openai'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleLogin(p)}
                  style={[styles.loginBtn, p === 'x' && styles.loginBtnX]}
                >
                  <Text style={[styles.loginBtnText, p === 'x' && { color: '#fff' }]}>
                    {p === 'x' ? '𝕏 ' : ''}Login with {providerLabel(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.connectedBar}>
            <Text style={{ color: '#0a7', fontWeight: '600' }}>✓ Connected to {providerLabel(connectedProvider)}</Text>
            <TouchableOpacity onPress={() => setConnectedProvider(null)}>
              <Text style={{ color: '#c33', fontSize: 13 }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Prompt + tweaks (only make sense once we have a base photo) */}
      {baseImage && (
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe the new direction..."
            multiline
          />

          <View style={styles.tweaksRow}>
            <Text style={styles.tweaksLabel}>Style</Text>
            {(['Modern', 'Rustic', 'Minimal', 'Industrial'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setCurrentTweaks((t) => ({ ...t, style: s }))}
                style={[styles.tweakChip, currentTweaks.style === s && styles.tweakChipActive]}
              >
                <Text style={[styles.tweakText, currentTweaks.style === s && styles.tweakTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tweaksRow}>
            {(['Warm neutrals', 'Bold colors', 'Cool tones', 'Earthy'] as const).map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCurrentTweaks((t) => ({ ...t, colorPalette: c }))}
                style={[styles.tweakChip, currentTweaks.colorPalette === c && styles.tweakChipActive]}
              >
                <Text style={[styles.tweakText, currentTweaks.colorPalette === c && styles.tweakTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tweaksRow}>
            {(['Open plan', 'Cozy nooks', 'Multi-zone', 'Studio'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => setCurrentTweaks((t) => ({ ...t, layout: l }))}
                style={[styles.tweakChip, currentTweaks.layout === l && styles.tweakChipActive]}
              >
                <Text style={[styles.tweakText, currentTweaks.layout === l && styles.tweakTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={reimagine}
            disabled={isGenerating || !connectedProvider}
            style={{ backgroundColor: isGenerating || !connectedProvider ? '#666' : '#000', paddingVertical: 18, borderRadius: 20, marginTop: 16 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: '600' }}>
              {isGenerating ? 'Generating with AI...' : connectedProvider ? `Reimagine with ${providerLabel(connectedProvider)}` : 'Connect to generate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCamera(true)} style={{ marginTop: 10, alignSelf: 'center' }}>
            <Text style={{ color: '#FF385C', fontWeight: '600' }}>+ Add another reference photo to this project</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AI Variations for this project */}
      {versions.length > 0 && (
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={styles.section}>AI Variations for {projectName}</Text>
          {versions.map((v) => (
            <View key={v.id} style={styles.versionCard}>
              <Image source={{ uri: v.imageUri }} style={styles.image} />
              <Text style={{ fontWeight: '600', marginTop: 4 }}>{v.prompt}</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                {v.tweaks.style} • {v.tweaks.colorPalette} • {v.tweaks.layout}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => makeCurrent(v)}
                  style={[styles.actionBtn, approvedDesign?.id === v.id && styles.actionBtnActive]}
                >
                  <Text style={styles.actionBtnText}>
                    {approvedDesign?.id === v.id ? 'Current Design ✓' : 'Make current'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sendToSourcing(v)} style={[styles.actionBtn, { backgroundColor: '#FF385C' }]}>
                  <Text style={[styles.actionBtnText, { color: '#fff' }]}>Send to Sourcing →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pipeline status — only really meaningful for the example, but always visible when data exists */}
      {(sourcingItems.length > 0 || laborTasks.length > 0) && (
        <View style={styles.pipelineCard}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6 }}>Project Pipeline</Text>
          <Text style={{ color: '#444' }}>
            Sourcing: {sourcingItems.length} items • {approvedCount} approved • ${sourcingTotal.toFixed(0)} total
          </Text>
          <Text style={{ color: '#444', marginTop: 2 }}>
            Labor: {laborTasks.length} tasks ready for scheduling
          </Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            Go to the Sourcing tab to approve items and generate the labor schedule. Labor tab shows the day-by-day $25/hr plan.
          </Text>
        </View>
      )}

      <View style={{ height: 60 }} />

      <Modal visible={showCamera} animationType="slide">
        <CameraScreen onPhotoTaken={handlePhotoTaken} onCancel={() => setShowCamera(false)} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 12 },
  tweakTextActive: { color: '#fff' },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },

  // --- All new + updated styles for the clean Design Studio rethink ---
  choiceCard: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 4,
  },
  choiceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  choiceSubtitle: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 21,
    marginBottom: 12,
  },
  choiceCta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF385C',
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderRadius: 14,
    backgroundColor: '#f2f2f2',
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loginBtn: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginBtnX: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  connectedBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
  },
  smallBtn: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    height: 64,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  tweaksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
    alignItems: 'center',
  },
  tweaksLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  tweakChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
  },
  tweakChipActive: {
    backgroundColor: '#222',
  },
  tweakText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  versionCard: {
    backgroundColor: '#fafafa',
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#222',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#0a7',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pipelineCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FF385C',
  },
});
