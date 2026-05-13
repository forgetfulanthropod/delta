const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

app.post('/api/reimagine', async (req, res) => {
  const { imageUri, prompt } = req.body;

  console.log('Generating reimagination for prompt:', prompt);

  // TODO: Replace with real call to image generation model
  // For now we return the original + enhanced prompt
  res.json({
    success: true,
    imageUri: imageUri,
    prompt: prompt,
    generated: true,
    message: 'Reimagination generated',
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});