import React, {useState} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import KycRecognition from './KycRecognition';
import {NavigationContainer} from '@react-navigation/native';

export default function App() {
  const [showModalCamera, setShowModalCamera] = useState(false);

  return (
    <NavigationContainer>
      <View style={styles.root}>
        <Text>
          Prueba de concepto Vision Camera con Face Detector y Worklets core
        </Text>
        <Button title="Open camera" onPress={() => setShowModalCamera(true)} />
        {showModalCamera && (
          <Modal
            visible={showModalCamera}
            onRequestClose={() => setShowModalCamera(false)}>
            <KycRecognition />
          </Modal>
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 20
  },
});
