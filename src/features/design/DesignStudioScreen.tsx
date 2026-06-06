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
    Alert.alert('Example Loaded', 'The Oak Street House is now active.\n\nSourcing has 8 items (some already approved).\nLabor tasks are ready.\n\nCost transparency: approved design now shows prominent summary panel with full materials+labor estimate (ready to go). Variations cards have highlighted cost pills. Send to Sourcing now confirms the total upfront.\nCheck Design (for costs), Sourcing and Labor tabs.');
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
    const c = estimateProjectCost(version);
    Alert.alert(
      'Current Design — Ready to Go',
      `This version is now your approved design for sourcing & labor.\n\n` +
      `Est. Project Cost (transparent & locked):\n` +
      `• Materials: $${c.materials}\n` +
      `• Labor: $${c.labor} (${c.hours}h @ $25/hr)\n` +
      `• TOTAL: $${c.total}\n\n` +
      `Costs are ready to go. Sourcing will use dynamic suggestions based on this design.`
    );
  };

  // Enhanced cost estimation realism tied directly to the AI-generated version's prompt + tweaks output.
  // Builds realism: room scope inference, complexity/luxury multipliers from AI description words,
  // tweak-specific premiums (e.g. bold/modern cost more for finishes), scaled labor for remodel effort.
  // Now produces more believable "ready to go" numbers that vary meaningfully with the reimagination details.
  function estimateProjectCost(v: DesignVersion) {
    const p = (v.prompt + ' ' + Object.values(v.tweaks).join(' ')).toLowerCase();
    let materials = 1350;  // slightly higher realistic base for full room remodel
    let laborHours = 16;

    // Core scope from AI prompt (kitchen/bath costliest)
    if (p.includes('kitchen') || p.includes('cabinet') || p.includes('island')) { materials += 2100; laborHours += 14; }
    else if (p.includes('bath') || p.includes('shower') || p.includes('vanity')) { materials += 1450; laborHours += 10; }
    if (p.includes('floor') || p.includes('lvp') || p.includes('hardwood') || p.includes('living') || p.includes('family')) { materials += 1100; laborHours += 9; }
    if (p.includes('light') || p.includes('electrical') || p.includes('recessed') || p.includes('pendant')) { materials += 520; laborHours += 7; }
    if (p.includes('paint') || p.includes('wall') || p.includes('color')) { materials += 420; laborHours += 6; }

    // Counter/surface premium from AI intent
    if (p.includes('counter') || p.includes('quartz') || p.includes('granite') || p.includes('backsplash')) { materials += 950; laborHours += 5; }

    // Plumbing fixtures
    if (p.includes('sink') || p.includes('faucet') || p.includes('shower')) { materials += 380; laborHours += 4; }

    // Tweak-driven realism (AI output variations affect cost)
    if (v.tweaks.style === 'Modern' || v.tweaks.style === 'Minimal') { materials += 480; laborHours += 5; } // premium finishes
    if (v.tweaks.style === 'Industrial') { materials += 320; laborHours += 3; }
    if (v.tweaks.layout === 'Open plan') { laborHours += 6; materials += 380; } // more demo/structural
    if (v.tweaks.layout === 'Multi-zone') { laborHours += 4; materials += 290; }
    if (v.tweaks.colorPalette === 'Bold colors') { materials += 380; } // specialty paint/products
    if (v.tweaks.colorPalette === 'Earthy' || v.tweaks.colorPalette === 'Warm neutrals') { materials += 180; } // natural materials premium

    // AI prompt complexity / luxury signals for realistic uplift (tied to what reimagine actually said)
    const luxuryWords = ['luxury', 'custom', 'high-end', 'statement', 'premium', 'designer', 'handcrafted', 'spa', 'gourmet'];
    const complexity = luxuryWords.filter(w => p.includes(w)).length;
    if (complexity > 0) {
      materials += complexity * 420;
      laborHours += complexity * 3;
    }
    if (p.includes('large') || p.includes('entire') || p.includes('whole') || p.includes('full')) {
      materials += 650; laborHours += 8;
    }
    if (p.includes('reimagine') || p.includes('transform')) {
      laborHours += 2; // extra for major change
    }

    const labor = Math.round(laborHours * 25);
    const total = materials + labor;

    // Round to nice increments for "ready to go" feel
    return {
      materials: Math.round(materials / 50) * 50,
      labor,
      total: Math.round(total / 50) * 50,
      hours: Math.round(laborHours),
    };
  }

  const sendToSourcing = async (version: DesignVersion) => {
    const c = estimateProjectCost(version);

    // Evolved "Send to Sourcing" to surface/confirm the total estimated cost first (owner cost transparency)
    // This makes costs feel "ready to go" before the handoff, in addition to version cards.
    Alert.alert(
      'Confirm & Send to Sourcing',
      `Estimated TOTAL project cost for this design: $${c.total}\n\n` +
      `Breakdown (ready to go):\n` +
      `• Materials: $${c.materials}\n` +
      `• Labor estimate: $${c.labor} (${c.hours} hours @ $25/hr)\n\n` +
      `This will:\n` +
      `- Set this as your current approved design\n` +
      `- Add context-aware material suggestions to Sourcing (you review/approve)\n` +
      `- Keep the full cost estimate visible for Labor scheduling\n\n` +
      `Proceed with this costed design?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Yes, Send ($${c.total} total)`,
          style: 'default',
          onPress: async () => {
            setApprovedDesign(version);

            try {
              await fetch('http://localhost:4000/api/reimagine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUri: version.imageUri, prompt: version.prompt }),
              });
            } catch {}

            // Significantly improved dynamic material suggestions based on actual prompt + tweaks.
            // Much richer analysis (room inference, style/color/layout specific SKUs, realistic qtys/prices).
            // Builds on the recent dynamic suggestions work + confirm cost UX. Produces targeted lists for better sourcing realism.
            const base = Date.now();
            const p = (version.prompt + ' ' + Object.values(version.tweaks).join(' ')).toLowerCase();
            const suggested: any[] = [];

            // Infer room type and scope for realistic quantities
            const isKitchen = p.includes('kitchen') || p.includes('cabinet') || p.includes('island');
            const isBath = p.includes('bath') || p.includes('shower') || p.includes('vanity');
            const isFloor = p.includes('floor') || p.includes('lvp') || p.includes('hardwood') || p.includes('living') || p.includes('family');
            const isLighting = p.includes('light') || p.includes('electrical') || p.includes('recessed') || p.includes('modern');
            const isPaint = p.includes('paint') || p.includes('wall') || p.includes('color');
            const isCounter = isKitchen || isBath || p.includes('counter') || p.includes('quartz') || p.includes('granite');
            const isHardware = p.includes('hardware') || p.includes('pull') || p.includes('knob') || isKitchen || isBath;

            // Flooring - core for most rooms, scale qty
            if (isFloor || isKitchen || isBath) {
              const floorQty = isKitchen ? 85 : isBath ? 45 : 160;
              suggested.push({ id: String(base), name: isKitchen || p.includes('hardwood') ? 'White Oak Engineered Flooring' : 'LVP Flooring - Oak', retailer: "Lowe's" as const, price: isKitchen ? 7.89 : 3.49, quantity: floorQty, approved: false, url: 'https://www.lowes.com' });
            }

            // Lighting - dynamic packs + style tweak
            if (isLighting || p.includes('modern') || version.tweaks.style === 'Modern' || version.tweaks.layout === 'Open plan') {
              suggested.push({ id: String(base + 10), name: 'LED 6" Recessed Lights (12-pack)', retailer: 'Home Depot' as const, price: 89, quantity: 2, approved: false, url: 'https://www.homedepot.com' });
              if (p.includes('statement') || version.tweaks.colorPalette === 'Bold colors') {
                suggested.push({ id: String(base + 11), name: 'Modern Pendant Light - Brushed Nickel', retailer: 'Amazon' as const, price: 129, quantity: 2, approved: false, url: 'https://www.amazon.com' });
              }
            }

            // Cabinets / hardware - tweak aware
            if (isHardware || isKitchen || isBath) {
              const hwName = version.tweaks.style === 'Industrial' || version.tweaks.colorPalette === 'Bold colors'
                ? 'Matte Black Cabinet Hardware Set (30pc)'
                : version.tweaks.style === 'Rustic' ? 'Brushed Brass Cabinet Pulls (24pc)' : 'Matte Black Cabinet Hardware Set (30pc)';
              suggested.push({ id: String(base + 20), name: hwName, retailer: 'Amazon' as const, price: 68, quantity: 1, approved: false, url: 'https://www.amazon.com' });
              if (isKitchen) {
                suggested.push({ id: String(base + 21), name: 'Soft-Close Cabinet Hinges (pair, 10pk)', retailer: "Lowe's" as const, price: 38, quantity: 3, approved: false, url: 'https://www.lowes.com' });
              }
            }

            // Paint / walls - palette driven
            if (isPaint || version.tweaks.colorPalette !== 'Warm neutrals') {
              const paintName = version.tweaks.colorPalette === 'Bold colors' ? 'Interior Paint - Charcoal Accent + Warm White (5 gal)' :
                                version.tweaks.colorPalette === 'Earthy' ? 'Interior Paint - Warm Taupe + Trim (5 gal)' :
                                'Interior Paint - Warm White (5 gal)';
              suggested.push({ id: String(base + 30), name: paintName, retailer: "Lowe's" as const, price: version.tweaks.colorPalette === 'Bold colors' ? 72 : 48, quantity: version.tweaks.colorPalette === 'Bold colors' ? 4 : 3, approved: false, url: 'https://www.lowes.com' });
            }

            // Counters / surfaces for kitchens/baths
            if (isCounter) {
              const counterName = version.tweaks.style === 'Modern' || version.tweaks.colorPalette === 'Cool tones' ? 'Quartz Countertop - Calacatta Laza' : 'Granite Countertop - Giallo Ornamental';
              suggested.push({ id: String(base + 40), name: counterName, retailer: "Lowe's" as const, price: 62, quantity: isKitchen ? 42 : 18, approved: false, url: 'https://www.lowes.com' });
              if (isKitchen) {
                suggested.push({ id: String(base + 41), name: 'Subway Tile Backsplash - White (10 sq ft box)', retailer: 'Home Depot' as const, price: 29, quantity: 3, approved: false, url: 'https://www.homedepot.com' });
              }
            }

            // Plumbing fixtures if bath/kitchen
            if (isBath || isKitchen || p.includes('sink') || p.includes('faucet')) {
              suggested.push({ id: String(base + 50), name: isBath ? 'Matte Black Pull-Down Faucet' : 'Farmhouse Apron Sink', retailer: 'Amazon' as const, price: isBath ? 179 : 420, quantity: 1, approved: false, url: 'https://www.amazon.com' });
              if (isBath) {
                suggested.push({ id: String(base + 51), name: 'Shower Faucet Trim Kit + Valve', retailer: 'Home Depot' as const, price: 145, quantity: 1, approved: false, url: 'https://www.homedepot.com' });
              }
            }

            // Layout/style extras
            if (version.tweaks.layout === 'Open plan' || version.tweaks.style === 'Minimal') {
              suggested.push({ id: String(base + 60), name: 'LED Strip Lighting Kit (for coves/island)', retailer: 'Amazon' as const, price: 35, quantity: 2, approved: false, url: 'https://www.amazon.com' });
            }
            if (version.tweaks.style === 'Rustic' || p.includes('fireplace') || p.includes('built-in')) {
              suggested.push({ id: String(base + 61), name: 'Wood Mantle / Built-in Shelving Kit', retailer: "Lowe's" as const, price: 185, quantity: 1, approved: false, url: 'https://www.lowes.com' });
            }

            // Fallback always adds at least core flooring if nothing matched (should be rare now)
            if (suggested.length === 0) {
              suggested.push({ id: String(base), name: 'LVP Flooring - Oak', retailer: "Lowe's" as const, price: 3.49, quantity: 120, approved: false, url: 'https://www.lowes.com' });
              suggested.push({ id: String(base + 30), name: 'Interior Paint - Warm White (5 gal)', retailer: "Lowe's" as const, price: 48, quantity: 2, approved: false, url: 'https://www.lowes.com' });
            }

            useDeltaStore.getState().addSourcingItems(suggested);
            Alert.alert('Sent to Sourcing', `Materials added. Est. total project cost $${c.total} (locked from design).\n\nSwitch to the Sourcing tab to review, approve items, and generate labor. The Labor tab will reflect the $25/hr schedule.`);
          },
        },
      ]
    );
  };

  // Initial clean chooser (no clunky keys, no 4-house grid)
  if (!baseImage) {
    return (
      <ScrollView style={styles.container}>
        <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1 }}>Design Studio</Text>
          <Text style={{ fontSize: 18, color: '#555', marginTop: 8, lineHeight: 24 }}>
            One house. Real photos. AI variations with direct cost estimates (materials + labor "ready to go"). Make current or confirm &amp; send to sourcing — costs are transparent and surfaced upfront.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
          <TouchableOpacity
            onPress={startNewProject}
            style={[styles.choiceCard, { backgroundColor: '#111' }]}
          >
            <Text style={styles.choiceTitle}>New Project</Text>
            <Text style={styles.choiceSubtitle}>Upload or take photos of your space. Start clean. Generate variations with est. costs shown on every card. Make current for summary, or Send to Sourcing (with cost confirm).</Text>
            <Text style={styles.choiceCta}>Take or upload photo →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loadExampleProject}
            style={[styles.choiceCard, { backgroundColor: '#F8F1E9', borderColor: '#E8D5C4', borderWidth: 1 }]}
          >
            <Text style={[styles.choiceTitle, { color: '#222' }]}>Example Project</Text>
            <Text style={[styles.choiceSubtitle, { color: '#444' }]}>
              The Oak Street House — before + after + AI concepts for one home, 4 AI directions with prominent cost breakdowns (ready to go), current design summary panel, sourcing + labor seeded.
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
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 720, alignSelf: 'center', width: '100%' }}>
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
        <View style={{ marginTop: 16, paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
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
      <View style={{ marginTop: 24, paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
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
        <View style={{ marginTop: 16, paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
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
        <View style={{ marginTop: 24, paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
          <Text style={styles.section}>AI Variations for {projectName}</Text>
          {versions.map((v) => (
            <View key={v.id} style={styles.versionCard}>
              <Image source={{ uri: v.imageUri }} style={styles.image} />
              <Text style={{ fontWeight: '600', marginTop: 4 }}>{v.prompt}</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                {v.tweaks.style} • {v.tweaks.colorPalette} • {v.tweaks.layout}
              </Text>

              {/* Prominent cost estimate box in each version card — direct owner visibility, "ready to go" */}
              {(() => {
                const c = estimateProjectCost(v);
                return (
                  <View style={styles.costPill}>
                    <Text style={styles.costPillTitle}>Ready to go — Est. Project Cost</Text>
                    <Text style={styles.costPillMain}>
                      Total ${c.total}
                    </Text>
                    <Text style={styles.costPillBreakdown}>
                      Materials ${c.materials} + Labor ${c.labor} ({c.hours}h)
                    </Text>
                  </View>
                );
              })()}

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

      {/* Prominent Owner Cost Summary panel — surfaces estimated costs directly in owner journey
          (in addition to version cards and instead of hiding behind "Send to Sourcing").
          Shows breakdown when a version is made current / approved. Makes costs feel "ready to go". */}
      {approvedDesign && (() => {
        const c = estimateProjectCost(approvedDesign);
        return (
          <View style={styles.costSummaryPanel}>
            <Text style={styles.costSummaryTitle}>Current Approved Design — Cost Summary</Text>
            <Text style={{ color: '#2e7d32', fontSize: 13, marginBottom: 6 }}>
              This design is locked in and ready to go for sourcing + labor.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: '600' }}>Materials (est.)</Text>
              <Text style={{ fontWeight: '700' }}>${c.materials}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: '600' }}>Labor (est. {c.hours}h × $25/hr)</Text>
              <Text style={{ fontWeight: '700' }}>${c.labor}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 6 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>TOTAL EST. PROJECT COST</Text>
              <Text style={{ fontWeight: '800', fontSize: 18, color: '#2e7d32' }}>${c.total}</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
              Full transparency: costs shown upfront on versions, confirmed before send, and visible in pipeline below.
              Sourcing shows material subtotal; Labor uses the $25/hr schedule.
            </Text>
          </View>
        );
      })()}

      {/* Improved pipeline status — now includes owner cost transparency + breakdowns for full picture.
          Always surfaces the ready-to-go total when an approved design exists. */}
      {(sourcingItems.length > 0 || laborTasks.length > 0 || approvedDesign) && (
        <View style={styles.pipelineCard}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6 }}>Project Pipeline</Text>
          {approvedDesign && (() => {
            const c = estimateProjectCost(approvedDesign);
            return (
              <Text style={{ color: '#2e7d32', fontWeight: '600', marginBottom: 4 }}>
                Est. full project (from current design): ${c.total} • Mats ${c.materials} + Labor ${c.labor}
              </Text>
            );
          })()}
          <Text style={{ color: '#444' }}>
            Sourcing: {sourcingItems.length} items • {approvedCount} approved • ${sourcingTotal.toFixed(0)} total (materials)
          </Text>
          <Text style={{ color: '#444', marginTop: 2 }}>
            Labor: {laborTasks.length} tasks ready for scheduling
          </Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            Go to the Sourcing tab to approve items and generate the labor schedule. Labor tab shows the day-by-day $25/hr plan. Design costs above are the owner-visible "ready to go" anchor.
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
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
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

  // New prominent styles for owner cost transparency (Priority #5)
  costPill: {
    marginTop: 8,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  costPillTitle: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  costPillMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1b5e20',
    marginTop: 2,
  },
  costPillBreakdown: {
    fontSize: 12,
    color: '#388e3c',
    marginTop: 1,
  },

  costSummaryPanel: {
    marginTop: 16,
    marginHorizontal: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#f1f8e9',
    borderWidth: 2,
    borderColor: '#4caf50',
    borderRadius: 14,
    padding: 16,
    // Strong visual to make costs "ready to go" and directly surfaced in owner flow
  },
  costSummaryTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    color: '#1b5e20',
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
