import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

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
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No camera device found</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
});