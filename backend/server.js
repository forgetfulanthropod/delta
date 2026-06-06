const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const XAI_API_KEY = process.env.XAI_API_KEY || '';

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
      let body: any = {
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});