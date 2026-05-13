import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

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

  const currentProvider = providers.find(p => p.id === selected);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>AI Image Provider</Text>
      
      <View style={styles.selectWrapper}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={styles.select}
        >
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </View>

      <TextInput
        secureTextEntry
        placeholder={currentProvider?.placeholder}
        value={apiKey}
        onChangeText={setApiKey}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Provider & Key</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  selectWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  select: {
    width: '100%',
    padding: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});