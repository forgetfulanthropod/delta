import React, { useState } from 'react';

const providers = [
  { id: 'x', name: 'X (Grok)', placeholder: 'xai-...' },
  { id: 'google', name: 'Google Gemini', placeholder: 'AIza...' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
];

export default function AIProviderSelector({ onProviderChange }: { onProviderChange: (provider: string, key: string) => void }) {
  const [selected, setSelected] = useState('x');
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey) {
      onProviderChange(selected, apiKey);
      alert('Provider saved. Your tokens will be used for generation.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-4">
      <div className="font-semibold mb-2">AI Image Provider</div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      >
        {providers.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input
        type="password"
        placeholder={providers.find(p => p.id === selected)?.placeholder}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 rounded text-sm"
      >
        Save Provider & Key
      </button>
    </div>
  );
}