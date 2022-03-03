import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Classtest, { ClassTest } from './Screens/ClassTest';
import Home from './Screens/Home';
import Testing from './Screens/testing';

export default function App() {
  return (
    <View style={styles.container}>
      <Home/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',

    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
