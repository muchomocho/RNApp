import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignIn from '../../Screens/SignIn'
import RecipeList from '../../Screens/RecipeList';
import CreateRecipe from '../../Screens/CreateRecipe';
import SignUp from '../../Screens/SignUp';
import AccountProfile from '../../Screens/AccountProfile'
import RecipeDetail from '../../Screens/RecipeDetail';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const BottomTab = () => {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,

            tabBarHideOnKeyboard: true,

            tabBarStyle: {
                position: 'absolute',
                backgroundColor: '#fff',
                height: 85,
                borderRadius: 10,
                margin: 10,
                ...styles.bottomtab_shadow
            },

            tabBarItemStyle: {
                padding: 5
            },

            tabBarLabelStyle: {
                color: '#2f7500',
                fontSize: 12
            },

            tabBarActiveTintColor: '#123',
        }}
        >
            <Tab.Screen 
            name='Sign in' 
            component={SignIn} 
            options={{
                tabBarLabel: 'Sign in',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen name='Sign up' component={SignUp} />
            <Tab.Screen name='Recipe' component={RecipeList} />
            <Tab.Screen name='Create' component={CreateRecipe} />
            <Tab.Screen name='Profile' component={AccountProfile}/>
            <Tab.Screen 
            name='Recipe detail' 
            component={RecipeDetail} 
            options={{
                tabBarItemStyle:{
                    height: 0, 
                    width: 0,
                    //backgroundColor: '#000', 
                    position: 'absolute'
                }}}/>
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    bottomtab_shadow: {
        elevation: 8,
        shadowColor: '#eee',
        shadowRadius: 10,
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
});

export default BottomTab