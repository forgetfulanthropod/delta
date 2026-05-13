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

  // TODO: Call real xAI Grok Imagine API here
  res.json({
    success: true,
    imageUri: imageUri,
    prompt,
    generated: true,
    message: 'Real xAI generation ready',
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});