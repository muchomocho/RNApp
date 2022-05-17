import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTab from './Components/BottonTab/BottomTab';
import CreateProfile from './Screens/CreateProfile';
import CreateRecord from './Screens/CreateRecord';
import CheckFoodData from './Screens/CheckFoodData';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Provider } from 'react-redux';
import { store } from './redux/store';
import Signin from './Screens/SignIn';

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
          <Stack.Screen name={'Create record'} 
            component={CreateRecord}
            initialParams={{ 
              isShowManualModal: false,
              isEditingFood: false,
            }}
          />
          <Stack.Screen 
            name={'Check fooddata'} 
            component={CheckFoodData}
          />
          <Stack.Screen 
            name='Sign in' 
            component={Signin} 
            options={{
                tabBarLabel: 'Sign in',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
              }}
            />
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
