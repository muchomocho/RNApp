import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from 'react-native-chart-kit'

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator(); 

function UserRecord(props) {
    
    const [data, setData] = useState([]);
    
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

    const getUserRecord = async () => {
        try {
            const result = await APIRequest.httpRequest({
            method: 'GET',
            endpoint: 'api/userrecords/?name=' 
            + props.route.params.userdata.name 
            //+ '?range='
            ,isAuthRequired: true
            });
            
            setData(result.json);
        
        } catch (error) {
        console.log('userrecord', error)
        }
    };

    // format data acquired to map onto graph
    const formatData = () => {
        const currentMonthDays = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
        var labels = new Array(currentMonthDays);
        for (var i = 0; i < currentMonthDays; i++) {
            labels[i] = date.getFullYear() + '-' + '0' + (date.getMonth()+1) + '-' + (i + 1)
        }

        var dataContainerObj = dietDataContainer();
        dataContainerObj.labels = labels;
        for (var prop in dataContainerObj) {
            if (Object.prototype.hasOwnProperty.call(dataContainerObj, prop)) {
                dataContainerObj[prop].data = new Array(currentMonthDays).fill(0);
            }
        }

        for (const dayData of data) {
            const index = labels.indexOf(dayData["date"]);
            if (index > -1) {
                // https://stackoverflow.com/questions/8312459/iterate-through-object-properties
                for (var prop in dayData) {
                    if (Object.prototype.hasOwnProperty.call(dayData, prop)
                    && Object.prototype.hasOwnProperty.call(dataContainerObj, prop)) {
                        dataContainerObj[prop].data[index] = parseFloat(dayData[prop]); 
                    }
                }
            }
        }
        return dataContainerObj;
    };

    const plot = () => {
        const data = formatData();

        return (
            <LineChart
                data={{
                labels: data.labels,
                datasets: [
                    {
                    data: data.energy.data
                    }
                ]
                }}
                width={Dimensions.get("window").width} // from react-native
                height={220}
                yAxisLabel="$"
                yAxisSuffix="k"
                yAxisInterval={100} // optional, defaults to 1
                chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                    borderRadius: 16
                },
                propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                }
                }}
                bezier
                style={{
                marginVertical: 8,
                borderRadius: 16
                }}
            />
        );
    };

    // https://reactnative.dev/docs/flatlist
    // https://github.com/indiespirit/react-native-chart-kit
    return(
        <View style={styles.container}>
            { plot() }
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //alignContent: 'center'
        marginTop: 50
    },
    header: {
        marginTop: '15%'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
    account:{
        backgroundColor: '#561ddb',
        borderRadius: 5,
        padding: 20,
        margin: 10,
    },
    accountText:{
        color: '#fff'
    },
    iconContainer: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 100
    },
    peopleTab: {
        flexDirection: 'row',
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 20,
        margin: 10,

        elevation: 3,
        shadowColor: '#eee',
        shadowRadius: 0,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
    peopleDetailContainer: {
        flex: 2,
        margin: 0, 
        //backgroundColor: '#000',
        marginLeft: '10%',
        //alignContent: 'center',
        //alignItems: 'center'
    },
    labelContainer:{
        flexDirection: 'row',
        borderBottomColor: '#000',
        borderBottomWidth: 0
    },
    peopleTextName:{
        fontSize: 20,
    },
    peopleText: {
        marginLeft: 10,
    },
    button: {
        width: '95%',
    }
});

export default UserRecord