const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const XAI_API_KEY = process.env.XAI_API_KEY || '';

app.post('/api/reimagine', async (req, res) => {
  const { imageUri, prompt } = req.body;

  console.log('Generating reimagination for prompt:', prompt);

  if (!XAI_API_KEY) {
    return res.json({
      success: true,
      imageUri: imageUri,
      prompt,
      message: 'Add XAI_API_KEY to backend to enable real generation',
    });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-imagine-image-quality',
        prompt: prompt || 'Modern home interior renovation',
        n: 1,
      }),
    });

    const data = await response.json();
    const generatedUrl = data?.data?.[0]?.url || imageUri;

    res.json({
      success: true,
      imageUri: generatedUrl,
      prompt,
      generated: true,
      message: 'Generated with xAI Grok Imagine',
    });
  } catch (error) {
    console.error('xAI API error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});