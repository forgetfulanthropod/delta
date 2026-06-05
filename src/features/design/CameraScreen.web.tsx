import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onPhotoTaken: (uri: string) => void;
  onCancel: () => void;
}

export default function CameraScreen({ onPhotoTaken, onCancel }: Props) {
  const handleFileSelect = (event: React.ChangeEvent<any>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e.target?.result) {
          onPhotoTaken(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photo (Web)</Text>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ margin: '20px 0' } as any}
      />

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
  cancelButton: { padding: 12, backgroundColor: '#ccc', borderRadius: 8 },
  cancelText: { fontSize: 16 },
});