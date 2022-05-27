import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';


import SignIn from '../../Screens/SignIn'
import RecipeListScreen from '../../Screens/RecipeListScreen';
import CreateRecipe from '../../Screens/CreateRecipe';
import SignUp from '../../Screens/SignUp';
import AccountProfile from '../../Screens/AccountProfile'
import RecipeDetail from '../../Screens/RecipeDetail';
import UserRecord from '../../Screens/UserRecords';
import FoodDataList from '../../Screens/FoodDataList';
import CreateRecord from '../../Screens/CreateRecord';
import CheckFoodData from '../../Screens/CheckFoodData';
import Request from '../../Screens/Request';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// const { user, currentSubuser, subuserArray } = useSelector(state => state.user);

const BottomTab = () => {
    return (
        <Tab.Navigator screenOptions={{
            //headerShown: false,

            tabBarHideOnKeyboard: true,

            tabBarStyle: {
                position: 'absolute',
                backgroundColor: '#fff',
                height: 60,
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
            name='Profile' 
            component={AccountProfile}
            initialParams={
                {
                    logoutRedirect: false
                }
            }
            options={{
                tabBarIcon: () => (<Image source={require("../../assets/icons/profile.png")} style={{height: 30, width: 30}} />)
            }}
            />
            <Tab.Screen name='Recipe' component={RecipeListScreen} 
            options={{
                tabBarIcon: () => (<Image source={require("../../assets/icons/recipe.png")} style={{height: 25, width: 25}} />)
            }}
            />
            <Tab.Screen name='Fooddata' component={FoodDataList} 
            initialParams={
                {
                    isRecording: false
                }
            }
            options={{
                tabBarIcon: () => (<Image source={require("../../assets/icons/fooddata.png")} style={{height: 30, width: 20}} />)
            }}
            />
            <Tab.Screen name='Request' component={Request} 
            options={{
                tabBarIcon: () => (<Image source={require("../../assets/icons/request.png")} style={{height: 30, width: 30}} />)
            }}
            />

            
            { /* we want to show tabs on these pages but not their icons in the tabs, so they are included here but hidden by style. */ }
            <Tab.Screen 
            name='Create recipe' 
            component={CreateRecipe} 
            options={{
                tabBarItemStyle: {
                    ...styles.hiddenItem
                }
            }}
            initialParams={
                {
                    isUpdate: false
                }
            }
            />

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
        elevation: 10,
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