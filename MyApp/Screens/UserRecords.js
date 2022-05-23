import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import UserGraph from "../Components/Chart/UserGraph";
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication"

import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser } from '../redux/userSlice'
import { clearRecord, setIsMealUpdate } from '../redux/mealRecordSlice'
import MealRecord from "../Components/FoodData/MealRecord";
import LoadingView from "../Components/LoadingView";
import { formatDate } from "../API/helper";
import TabSwitch from "../Components/TabSwitch";
import SubuserBanner from "../Components/SubuserBanner";
import RecipeList from "../Components/Recipe/RecipeList";

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator(); 

function UserRecord(props) {
    
    const { user, currentSubuser } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [isDataLoading, setDataLoading] = useState(true);
    const [isMealDataLoading, setMealDataLoading] = useState(true);
    const [data, setData] = useState([]);
    const [mealData, setMealData] = useState([]);
    const [dateRange, setDateRange] = useState(-6);
    const [reload, setReload] = useState(0);
    
    var date = new Date()
    date.setHours(23)
    date.setMinutes(59)
    date.setSeconds(59);

    const reloadHandler = async () => {
        try {
            await getUserRecord();
            await getUserMealRecord();
        } catch (error) {
            
        }
    };
        
    const blurHandler = () => {
        setDataLoading(true);
        setMealDataLoading(true);
    };

    const reloadFromChild = async () => {
        blurHandler();
        reloadHandler();
    }
    // https://reactnavigation.org/docs/function-after-focusing-screen/
    // https://stackoverflow.com/questions/67102832/how-to-use-focus-and-blur-listener-in-single-useeffect-react-native
    useEffect(() => {

        props.navigation.addListener('focus', reloadHandler);
        props.navigation.addListener('blur', blurHandler);
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return () => {
            props.navigation.removeListener('focus', reloadHandler)
            props.navigation.removeListener('blur', blurHandler)
        }
    }, [props, currentSubuser.id]);


    // calculates the date from today with parameter +ve = future, -ve = past
    const calculateDate = (daysToShift) => {
        const fromDate = new Date()
        fromDate.setDate(date.getDate() + daysToShift)

        return (formatDate(fromDate));
    };
    
    // returns array of dates from paramter until today
    const datesFrom = (daysToShift) => {
        const currentDate = new Date()
        currentDate.setDate(date.getDate() + daysToShift)
        currentDate.setHours(0)
        currentDate.setMinutes(0)
        currentDate.setSeconds(0)
        var dates = new Array();

        for (;currentDate <= date; currentDate.setDate(currentDate.getDate() + 1)) {
            dates.push(formatDate(currentDate));
        }
        return dates
    };

    const getUserRecord = async () => {
        
        try {
            const result = await APIRequest.httpRequest({
                method: 'GET',
                endpoint: 'api/useraccounts/'
                + user.username
                + '/subuser/'
                + currentSubuser.id
                + '/userrecord/'
                + formatDate(date) + '/'
                + 'from/' + calculateDate(dateRange) + '/'
                ,isAuthRequired: true,
                navigation: props.navigation
            });
            setData(result.json);
            setDataLoading(false);
        
        } catch (error) {

        }
    };

    const getUserMealRecord = async () => {
        const dates = datesFrom(dateRange);
        var data = []

        for (var recordDate in dates) {
            try {
           
                const result = await APIRequest.httpRequest({
                    method: 'GET',
                    endpoint: `api/useraccounts/${user.username}/subuser/${currentSubuser.id}/usermealrecord/?date=${dates[recordDate]}`,
                    isAuthRequired: true,
                    navigation: props.navigation
                });
                if (result.response.status == 200) {
                    data.push({date: dates[recordDate], data: result.json})
                } else {

                }
            } catch (error) {
                
            }
        }
        setMealData(data);
        setMealDataLoading(false);
    };

    // https://reactnative.dev/docs/flatlist
    // https://github.com/indiespirit/react-native-chart-kit
    
    const plot = () => {
        if (isDataLoading || data == undefined) {
            return (
                <View >
                    <LoadingView/>
                </View> 
            )
        }
        return(
            <ScrollView>
                <UserGraph
                    data={data}
                    dates={datesFrom(dateRange)}
                />
            </ScrollView>
        );
    };

    const mealRecordList = () => {

        if (isMealDataLoading || mealData == undefined) {
            return (
                <View style={{height: '100%', width: '100%', backgroundColor: '#fff'}}>
                    <LoadingView/>
                </View> 
            );
        }
        
        return (
            <View style={[styles.container]}>
                <FlatList
                    horizontal
                    data={mealData}
                    renderItem={
                        ({item}) => 
                            {
                                return (
                                <View style={{height: '100%', width: Dimensions.get('window').width * 0.9, paddingHorizontal: 10}}>
                                    <CustomButton
                                    text={item.date}
                                    buttonStyle={styles.button}
                                    onPress={()=>{}}
                                    />
                                    <MealRecord
                                        data={item.data}
                                        navigation={props.navigation}
                                        parentSet={reloadFromChild}
                                    />
                                </View>)
                            }
                    }
                    keyExtractor={item => item.date}
                />
                { createRecordButton() }
            </View>
        );
    };

    const createRecordButton= () => {
        if (isMealDataLoading || mealData == undefined) {
            return (
                <View style={{height: 300, margin: 10, elevation: 3, backgroundColor: '#fff'}}>
                    <LoadingView/>
                </View>    
            )
        }
        if (currentSubuser.privilege_all || currentSubuser.privilege_recordable) {
            return (
                <CustomButton
                    text={'Create Record'}
                    onPress={()=>{
                        dispatch(clearRecord());
                        dispatch(setIsMealUpdate(false));
                        props.navigation.navigate('Create record');
                    }}
                />
            );
        }
    };

    const recipeRecommendation = () => {
        return <RecipeList navigation={props.navigation} isRecommendation={true}/>
    };

    const components = [
        { id: 1, title: 'graph', component: plot() }, 
        { id: 2, title: 'records', component: mealRecordList() }, 
        { id: 3, title: 'recommendation', component: recipeRecommendation() }
    ];

    
    return(
        <>
            <SubuserBanner/>
            <TabSwitch titleComponentArray={components} />
        </>
    );
    
}

const styles = StyleSheet.create({
    container: {
        //minHeight: 300,
        height: '100%',
        //width: '95%',
        backgroundColor: '#fff',
        borderRadius: 5,
        //marginTop: '5%',
        //marginLeft: '2.5%',

        elevation: 1,
        shadowColor: '#eee',
        shadowRadius: 0,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
    
    mealRecordContainer: {
        height: 3000,
    },
    header: {
        marginTop: '15%'
    },
    button: {

    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
});

export default UserRecord