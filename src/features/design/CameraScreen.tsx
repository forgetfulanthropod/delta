import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
// Native vision-camera integration (Priority #3): permissions added to Info.plist + AndroidManifest.xml.
// Fallbacks: demo photo always available if device/permission unavailable.
// Web uses solid CameraScreen.web.tsx (preview + hidden input + demo).
// For full prod: run pod install (iOS), ensure reanimated if using frame processors (not required for basic photo).

interface Props {
  onPhotoTaken: (uri: string) => void;
  onCancel: () => void;
}

export default function CameraScreen({ onPhotoTaken, onCancel }: Props) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const takePhoto = async () => {
    if (!camera.current) return;

    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });
      onPhotoTaken(`file://${photo.path}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to capture photo. Using demo fallback?');
      useDemoPhoto();
    }
  };

  const useDemoPhoto = () => {
    // Better fallback: demo photo works on iOS/Android + web (used by DesignStudio examples and worker)
    // Ensures camera experience is usable even if hardware/perms not available (e.g. simulator, no cam device)
    onPhotoTaken('/ai-room-1.jpg');
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={useDemoPhoto} style={[styles.button, { marginTop: 12, backgroundColor: '#555' }]}>
          <Text style={styles.buttonText}>Use Demo Photo Instead</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { marginTop: 12, backgroundColor: '#333' }]}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>No camera device found on this device</Text>
        <TouchableOpacity onPress={useDemoPhoto} style={styles.button}>
          <Text style={styles.buttonText}>Use Demo Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { marginTop: 12, backgroundColor: '#333' }]}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsReady(true)}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, !isReady && styles.disabled]}
          onPress={takePhoto}
          disabled={!isReady}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        {/* Fallback always available for solid cross-platform experience */}
        <TouchableOpacity style={styles.demoLink} onPress={useDemoPhoto}>
          <Text style={styles.demoLinkText}>Demo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#000',
  },
  disabled: { opacity: 0.4 },
  cancelButton: { padding: 16 },
  cancelText: { color: 'white', fontSize: 18 },
  button: { marginTop: 20, padding: 12, backgroundColor: '#1976d2', borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16 },
  demoLink: { padding: 12 },
  demoLinkText: { color: '#FF385C', fontSize: 16, fontWeight: '600' },
});