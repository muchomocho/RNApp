import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Recipe from './Screens/Recipe';
import SingIn from './Screens/SignIn'
import BottomTab from './Components/BottonTab/BottomTab';
import CreateProfile from './Screens/CreateProfile';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={'Tab'} component={BottomTab}/>
        <Stack.Screen name={'CreateProfile'} component={CreateProfile}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
