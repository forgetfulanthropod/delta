import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';

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
      Alert.alert('Provider saved', 'Your tokens will be used for generation (if supported by backend).');
    }
  };

  const currentProvider = providers.find(p => p.id === selected);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>AI Image Provider</Text>

      {/* Cross-platform provider selector (buttons instead of <select>) */}
      <View style={styles.providerRow}>
        {providers.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setSelected(p.id)}
            style={[
              styles.providerChip,
              selected === p.id && styles.providerChipActive,
            ]}
          >
            <Text
              style={[
                styles.providerText,
                selected === p.id && styles.providerTextActive,
              ]}
            >
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
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
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  providerChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  providerChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  providerText: {
    fontSize: 12,
    color: '#333',
  },
  providerTextActive: {
    color: '#fff',
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