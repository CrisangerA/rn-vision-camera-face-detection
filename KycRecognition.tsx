import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
  runAsync,
} from 'react-native-vision-camera';
import {
  Face,
  useFaceDetector,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Dimensions, StyleSheet, View, Text, Button } from 'react-native';
import { useIsFocused } from '@react-navigation/core';
import { Worklets } from 'react-native-worklets-core';
// Theme

const screenWidth = Dimensions.get('window').width;
export default function KycRecognition() {
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === 'active';

  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [
    { photoResolution: 'max', photoAspectRatio: 1 },
    { fps: 60 },
  ]);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    // detection options
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    console.log('faces detected', faces);
  });

  // const handleDetectedFaces = () => {
  //   'worklet';
  //   console.log('Function called in worklet');
  // };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      runAsync(frame, () => {
        'worklet';
        const faces = detectFaces(frame);
        // ... chain some asynchronous frame processor
        // ... do something asynchronously with frame
        handleDetectedFaces(faces);
      });
      // ... chain frame processors
      // ... do something with frame
    },
    [handleDetectedFaces],
  );

  // Check and request permissions
  const { hasPermission, requestPermission } = useCameraPermission();

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasPermission) {
    return (
      <Text>
        Otorga permisos para acceder a la camara
      </Text>
    );
  }

  if (device == null) {
    return (
      <Text>
        No se ha detectado la cámara
      </Text>
    );
  }

  return (
    <View style={styles.root}>
      <Text>
      KYC Reconocimiento
      </Text>
      <Camera
        //style={[StyleSheet.absoluteFill, styles.camera]}
        style={styles.camera}
        device={device}
        format={format}
        isActive={isActive}
        fps={format?.maxFps ?? 30}
        frameProcessor={frameProcessor}
        onError={(error) => console.log(error, 'kyc_recognition')}
      />
      <Button title="Check worklets core" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.75,
    // width: screenWidth,
    // height: screenHeight,
  },
});


// -----------------------------------------------------------
export function useAppState() {
  const currentState = AppState.currentState;
  const [appState, setAppState] = useState(currentState);

  useEffect(() => {
    function onChange(newState: AppStateStatus) {
      setAppState(newState);
    }

    const subscription = AppState.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}
