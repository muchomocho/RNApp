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
import UserRecord from '../../Screens/UserRecords';

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
            <Tab.Screen name='Recipe' component={RecipeList} />
            <Tab.Screen name='Create' component={CreateRecipe} />
            <Tab.Screen name='Profile' component={AccountProfile}/>

            { /* we want to show tabs on these pages but not their icons in the tabs, so they are included here but hidden by style. */ }
            <Tab.Screen 
            name='Sign up' 
            component={SignUp} 
            options={{
                tabBarItemStyle:{
                    ...styles.hiddenItem
                }}}
            />

            <Tab.Screen 
            name='Recipe detail' 
            component={RecipeDetail} 
            options={{
                tabBarItemStyle:{
                   ...styles.hiddenItem
                }}}/>

            <Tab.Screen
            name='User record'
            component={UserRecord}
            options={{
                tabBarItemStyle:{
                    ...styles.hiddenItem
                }}}
            />
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
    hiddenItem: {
        height: 0, 
        width: 0,
        //backgroundColor: '#000', 
        position: 'absolute'
    },
});

export default BottomTab