import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import UserGraph from "../Components/Chart/UserGraph";
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication"

import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser } from '../redux/actions'

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator(); 

function UserRecord(props) {
    
    const { user, currentSubuser, subuserArray } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    const [data, setData] = useState([]);

    const [dateRange, setDateRange] = useState(-6);
    
    const date = new Date();

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            try {
                await getUserRecord();
            } catch (error) {
                console.log(error)
            }
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

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
        var dates = new Array();
        
        for (;currentDate.getDate() <= date.getDate(); currentDate.setDate(currentDate.getDate() + 1)) {
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
            + '/userdata/'
            + currentSubuser.name
            + '/userrecord/'
            + '?from=' + calculateDate(dateRange) 
            ,isAuthRequired: true
            });

            setData(result.json);
            console.log('result',result.json)
        
        } catch (error) {
            console.log('userrecord', error)
        }
    };

    // // format data acquired to map onto graph
    // const formatData = () => {
    //     const currentMonthDays = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    //     var labels = new Array(currentMonthDays);
    //     for (var i = 0; i < currentMonthDays; i++) {
    //         labels[i] = date.getFullYear() + '-' + '0' + (date.getMonth()+1) + '-' + (i + 1)
    //     }

    //     var dataContainerObj = dietDataContainer();
    //     for (var prop in dataContainerObj) {
    //         if (Object.prototype.hasOwnProperty.call(dataContainerObj, prop)) {
    //             dataContainerObj[prop].data = new Array(currentMonthDays).fill(0);
    //         }
    //     }

    //     for (const dayData of data) {
    //         const index = labels.indexOf(dayData["date"]);
    //         if (index > -1) {
    //             // https://stackoverflow.com/questions/8312459/iterate-through-object-properties
    //             for (var prop in dayData) {
    //                 if (Object.prototype.hasOwnProperty.call(dayData, prop)
    //                 && Object.prototype.hasOwnProperty.call(dataContainerObj, prop)) {
    //                     dataContainerObj[prop].data[index] = parseFloat(dayData[prop]); 
    //                 }
    //             }
    //         }
    //     }

    //     labels.forEach((element, index, Array) => {
    //         if (index === (parseInt(date.getDate()) - 1)) {
    //             Array[index] = 'today';
    //         }
    //         /*
    //         else if (index === 0 || index === (Array.length - 1) ) {
    //             Array[index] = element.replace('2022-', '');
    //         }
    //         */ 
    //         else {
    //             Array[index] = '|';
    //         }
    //     });

    //     dataContainerObj.labels = labels;
    //     return dataContainerObj;
    // };

    // const datesToTodayFrom = () => {

    // };

    // const plot = () => {
    //     // dayData = nutrition data of each day
    //     var dataList = dietDataContainer();

    //     // populate arrays
    //     for (const dayData of data) {
    //         // https://stackoverflow.com/questions/8312459/iterate-through-object-properties
    //         for (var prop in dayData) {
    //             // confirm daydata obj has key prop
    //             if (Object.prototype.hasOwnProperty.call(dayData, prop) && Object.prototype.hasOwnProperty.call(dataList, prop)) {
    //                 // check object dataList[prop] has key 'data'
    //                 // if not initialise array
    //                 if (!Object.prototype.hasOwnProperty.call(dataList[prop], 'data')) {
    //                     dataList[prop].data = new Array();
    //                 }
    //                 const xData = dayData['date']
    //                 const xVal = new Date(xData).getDate();
    //                 const yVal = parseFloat(dayData[prop]);
    //                 const plotData = { x: xVal, y: yVal };
  
    //                 dataList[prop].data.push(plotData);
    //             }
    //         }
    //     }

    //     return (
    //         <FlatList
    //         horizontal
    //         style={styles.container}
    //         data={Object.keys(dataList)}
    //         renderItem={({item}) => {
    //             return (
    //                 <UserGraph
    //                 name={item}
    //                 data={dataList[item].data}
    //                 userData={props.route.params.userdata}
    //                 />
    //             );
    //         }}
    //         keyExtractor={item => item}
    //         />
    //     );
    //     // return (
    //     //     <UserGraph 
    //     //     data={dataList.energy.data}
    //     //     />
    //     // );
    // };

    // https://reactnative.dev/docs/flatlist
    // https://github.com/indiespirit/react-native-chart-kit
    
    const plot = () => {
        return(
            <View>
                <UserGraph
                    data={data}
                    userData={props.route.params.userdata}
                    dates={datesFrom(dateRange)}
                />
            </View>
        );
    };
    
    return(
        <View style={styles.graphContainer}>
            { plot() }
            <CustomButton
            text={'Create Record'}
            onPress={()=>{props.navigation.navigate('Create record')}}
            />
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#000',
        //alignContent: 'center'
        marginTop: 50,
    },
    header: {
        marginTop: '15%'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
});

export default UserRecord