import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { DEMO_IMAGE_PATHS, getImageSource } from '../../shared/media';

interface Props {
  onPhotoTaken: (uri: string) => void;
  onCancel: () => void;
}

export default function CameraScreen({ onPhotoTaken, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const triggerFileSelect = () => {
    // Use hidden input + ref for better styled button (solid web upload UX)
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<any>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e.target?.result) {
          setPreviewUri(e.target.result as string); // data: URI for upload
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input so same file can be re-selected if needed
    if (event.target) event.target.value = '';
  };

  const useSelectedPhoto = () => {
    if (previewUri) {
      onPhotoTaken(previewUri); // data: passes through normalize
    }
  };

  const chooseAnother = () => {
    setPreviewUri(null);
    // allow immediate re-trigger
    setTimeout(() => triggerFileSelect(), 0);
  };

  const useDemoPhoto = () => {
    // Solid fallback for web (and works cross-platform in DesignStudio examples)
    // Uses shared DEMO paths (gallery fallback documented in src/shared/media.ts)
    const demoUri = DEMO_IMAGE_PATHS[0];
    onPhotoTaken(demoUri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Take or Upload Photo</Text>
        <Text style={styles.subtitle}>Web: file picker or demo fallback</Text>
      </View>

      {!previewUri ? (
        <>
          <TouchableOpacity style={styles.selectArea} onPress={triggerFileSelect}>
            <Text style={styles.selectText}>📷 Select Photo from Device</Text>
            <Text style={styles.selectHint}>Click to open file picker (images only)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={useDemoPhoto}>
            <Text style={styles.demoText}>Use Demo Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.previewContainer}>
            <Image source={getImageSource(previewUri)} style={styles.previewImage} />
            <Text style={styles.previewHint}>Preview — ready to use as base photo</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.useBtn]} onPress={useSelectedPhoto}>
              <Text style={styles.actionBtnText}>✓ Use this Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.anotherBtn]} onPress={chooseAnother}>
              <Text style={styles.actionBtnText}>Choose Different</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Hidden native file input for solid web file handling (triggered by styled button) */}
      <input
        ref={fileInputRef as any}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' } as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#111' },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#aaa' },
  selectArea: {
    width: 280,
    height: 160,
    backgroundColor: '#222',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  selectHint: { color: '#888', fontSize: 13, marginTop: 8, textAlign: 'center' },
  demoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 24,
  },
  demoText: { color: '#FF385C', fontSize: 15, fontWeight: '600' },
  previewContainer: {
    width: 280,
    height: 200,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewHint: { color: '#888', fontSize: 12, marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 130,
    alignItems: 'center',
  },
  useBtn: { backgroundColor: '#0a7' },
  anotherBtn: { backgroundColor: '#444' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: { padding: 12, backgroundColor: '#555', borderRadius: 8 },
  cancelText: { color: '#fff', fontSize: 16 },
});
