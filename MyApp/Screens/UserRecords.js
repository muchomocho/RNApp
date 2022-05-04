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
            console.log(error)
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

    // format the date in the format we want to use YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // jan = 0
        const day = date.getDate();

        const digitFormat = (someDate) => {
            return ((''+someDate).length < 2 ? '0' + someDate : someDate)
        };

        return (
            year + '-' + digitFormat(month) + '-' + digitFormat(day)
        );
    };

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
        console.log(currentDate)
        console.log(date)
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
                + currentSubuser.name
                + '/userrecord/'
                + formatDate(date) + '/'
                + 'from/' + calculateDate(dateRange) + '/'
                ,isAuthRequired: true,
                navigation: props.navigation
            });
            setData(result.json);
            setDataLoading(false);
            // console.log('result',result.json)
        
        } catch (error) {
            console.log('userrecord', error)
        }
    };

    const getUserMealRecord = async () => {
        const dates = datesFrom(dateRange);
        var data = []

        for (var recordDate in dates) {
            try {
                console.log(recordDate)
                const result = await APIRequest.httpRequest({
                    method: 'GET',
                    endpoint: `api/useraccounts/${user.username}/subuser/${currentSubuser.name}/usermealrecord/?date=${dates[recordDate]}`,
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
                <View style={{height: 300, margin: 10, elevation: 3, backgroundColor: '#fff'}}>
                    <LoadingView/>
                </View> 
            )
        }
        return(
            <View>
                <UserGraph
                    data={data}
                    dates={datesFrom(dateRange)}
                />
            </View>
        );
    };

    const mealRecordList = () => {

        if (isMealDataLoading || mealData == undefined) {
            return (
                <View style={{height: 300, margin: 10, elevation: 3, backgroundColor: '#fff'}}>
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
                            <View style={{width: Dimensions.get('window').width * 0.9, paddingHorizontal: 10}}>
                                <CustomButton
                                text={item.date}
                                buttonStyle={styles.button}
                                onPress={()=>{}}
                                />
                                <MealRecord
                                    data={item.data}
                                    navigation={props.navigation}
                                    onDevice={props.onDevice}
                                    parentSet={reloadFromChild}
                                />
                            </View>)
                            }
                    }
                    keyExtractor={item => item.date}
                />

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
    };

    const components = [
        { id: 1, component: plot() }, 
        { id: 2, component: mealRecordList() }, 
        { id: 3, component: createRecordButton() }
    ];

    
    return(
        
        <FlatList
        data={components}
        renderItem={
            ({item}) => 
                item.component
        }
        keyExtractor={item => item.id}
        ListFooterComponent={
            <View style={styles.footer}>
    
            </View>
        }
        />
    );
    
}

const styles = StyleSheet.create({
    container: {
        minHeight: 300,
        height: 'auto',
        width: '95%',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginTop: '5%',
        marginLeft: '2.5%',

        elevation: 3,
        shadowColor: '#eee',
        shadowRadius: 0,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
    
    mealRecordContainer: {
        height: 300,
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