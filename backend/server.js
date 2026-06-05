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

  // Phase 2: better prompt that references the source image + provider aware stub
  const basePrompt = prompt || 'Modern home interior renovation';
  const imageAwarePrompt = `${basePrompt} — reimagine this exact uploaded room photo, preserve architecture and lighting where possible`;

  if (provider === 'x' || !provider) {
    try {
      const response = await fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-imagine-image-quality',
          prompt: imageAwarePrompt,
          n: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || 'xAI generation failed');
      }
      const generatedUrl = data?.data?.[0]?.url || imageUri;

      return res.json({
        success: true,
        imageUri: generatedUrl,
        prompt: imageAwarePrompt,
        generated: true,
        provider: 'x',
        message: 'Generated with xAI Grok Imagine (image-aware prompt)',
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