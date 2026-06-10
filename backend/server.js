const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const XAI_API_KEY = process.env.XAI_API_KEY || '';
const STARTED_AT = new Date().toISOString();

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    version: '0.2.0',
    startedAt: STARTED_AT,
    hasXaiKey: !!XAI_API_KEY,
    routes: ['/api/health', '/api/reimagine', '/api/projects'],
  });
});

app.post('/api/reimagine', async (req, res) => {
  const { imageUri, prompt, provider = 'x', apiKey } = req.body;

  console.log('Generating reimagination provider:', provider, 'prompt:', prompt);

  const effectiveKey = apiKey || XAI_API_KEY;

  if (!effectiveKey) {
    return res.json({
      success: true,
      imageUri: imageUri,
      prompt,
      message: 'Add XAI_API_KEY to backend env or provide via UI to enable real generation',
    });
  }

  // Significantly improved image-aware prompt construction + support for passing image references.
  // When imageUri is a data: URI (web uploads) or http, use the xAI /images/edits endpoint (supports base64 data URI and public URLs per docs).
  // This enables the model to actually "see" / understand the uploaded room photo for realistic transformations (beyond prompt-only).
  // The prompt now explicitly instructs detailed visual analysis and preservation of real photo details.
  const basePrompt = prompt || 'Modern home interior renovation';
  const imageAwarePrompt = [
    'Using the provided reference photo of the ACTUAL room as the precise visual baseline (do not invent a different room or ignore its structure):',
    '1. Carefully analyze and preserve: exact camera perspective/angle, room proportions and scale, architectural details (walls, ceilings, windows/doors placements, trim, built-ins), current lighting direction and shadows, existing fixed elements unless the request changes them.',
    '2. Reimagine ONLY with the following design intent while keeping photorealistic home remodel quality and material realism:',
    basePrompt,
    'Apply style, color, layout, and material changes naturally to the existing space. High detail, accurate physics of light/materials, no cartoonish or impossible alterations.',
  ].join(' ');

  if (provider === 'x' || !provider) {
    try {
      const hasImageRef = imageUri && (imageUri.startsWith('data:') || imageUri.startsWith('http'));

      let endpoint = 'https://api.x.ai/v1/images/generations';
      let body = {
        model: 'grok-imagine-image-quality',
        prompt: imageAwarePrompt,
        n: 1,
      };

      if (hasImageRef) {
        // Pass image reference for editing / image understanding path.
        endpoint = 'https://api.x.ai/v1/images/edits';
        body = {
          model: 'grok-imagine-image-quality',
          prompt: imageAwarePrompt,
          image: {
            url: imageUri,
            type: 'image_url',
          },
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || 'xAI generation/editing failed');
      }
      const generatedUrl = data?.data?.[0]?.url || imageUri;

      return res.json({
        success: true,
        imageUri: generatedUrl,
        prompt: imageAwarePrompt,
        generated: true,
        provider: 'x',
        usedImageRef: !!hasImageRef,
        message: hasImageRef
          ? 'Generated with xAI Grok Imagine (image reference + detailed visual analysis for realistic transformation)'
          : 'Generated with xAI Grok Imagine (enhanced image-aware prompt)',
      });
    } catch (error) {
      console.error('xAI API error:', error);
      return res.json({ success: false, error: error.message || String(error) });
    }
  }

  // Stub for other providers (extend with real calls + their keys in future)
  // For demo, return a variant or the original
  return res.json({
    success: true,
    imageUri: imageUri,
    prompt: imageAwarePrompt,
    provider,
    message: `Provider "${provider}" stub: using original image. Add real integration + key support in backend.`,
  });
});

// --- Persistence routes (Priority #2: Data & Persistence) ---
// In-memory demo store for multi-project save/load (designs, sourcing, labor, versions + metadata).
// Used by the enhanced useDeltaStore (saveProjectToBackend etc). No file I/O for simplicity (in-mem only while running).
// Does not affect AI route. Now includes versions array for Phase 1 Design Studio per-project persistence.
const projectsStore = {};

app.get('/api/projects', (req, res) => {
  res.json({ success: true, projects: Object.values(projectsStore) });
});

app.post('/api/projects', (req, res) => {
  const { id, name = 'Untitled', approvedDesign = null, sourcingItems = [], laborTasks = [], versions = [] } = req.body || {};
  const projId = id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const existing = projectsStore[projId] || {};
  projectsStore[projId] = {
    id: projId,
    name,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    approvedDesign,
    sourcingItems,
    laborTasks,
    versions,
  };
  res.json({ success: true, project: projectsStore[projId] });
});

app.get('/api/projects/:id', (req, res) => {
  const p = projectsStore[req.params.id];
  if (!p) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, project: p });
});

app.delete('/api/projects/:id', (req, res) => {
  const existed = !!projectsStore[req.params.id];
  delete projectsStore[req.params.id];
  res.json({ success: true, deleted: existed });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
