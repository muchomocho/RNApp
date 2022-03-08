import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignIn from '../../Screens/SignIn'
import Recipe from '../../Screens/Recipe';
import ClassTest from '../../Screens/ClassTest';
import CreateRecipe from '../../Screens/CreateRecipe';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='SignIn' component={SignIn} />
            <Tab.Screen name='ClassTest' component={ClassTest} />
            <Tab.Screen name='Recipe' component={Recipe} />
            <Tab.Screen name='CreateRecipe' component={CreateRecipe} />
        </Tab.Navigator>
    )
}

export default BottomTab