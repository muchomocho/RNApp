import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTab from './Components/BottonTab/BottomTab';
import CreateProfile from './Screens/CreateProfile';
import CreateRecord from './Screens/CreateRecord';
import ConfirmFoodData from './Screens/ConfirmFoodData';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Provider } from 'react-redux';
import { store } from './redux/store';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator 
        screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name={'Tab'} component={BottomTab}/>
          <Stack.Screen name={'Create profile'} component={CreateProfile}/>
          <Stack.Screen name={'Create record'} component={CreateRecord}/>
          <Stack.Screen name={'Confirm fooddata'} component={ConfirmFoodData}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
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
