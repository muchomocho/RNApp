import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { VictoryBar, DataLabel, VictoryChart, VictoryTheme, VictoryLine, VictoryAxis, VictoryGroup, VictoryScatter, VictoryLabel } from "victory-native";
import json from '../../assets/JSON/gov_diet_recommendation.json';
import json_unit from '../../assets/JSON/gov_diet_recommendation_units.json';
import CustomButton from "../CustomButton";
import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser } from '../../redux/userSlice'
import { genderMap, ageMap, lessThanNutrients } from "../../API/helper";

export default function UserGraph ({ data, dates }) {

    const windowWidth =  Dimensions.get('window').width
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);

    const [focusData, setFocusData] = useState('energy_kcal');

    const formatDate = (dateStr) => {
        return dateStr.split('-')[2];
    }

    const datePoint = () => {
        if (dates !== undefined && dates.length > 0 ) {
            const date = dates[dates.length - 1];
            var index = -1
            if (Object.prototype.hasOwnProperty.call(data, focusData) 
            && Object.prototype.hasOwnProperty.call(data, 'date')) {
                index = data['date'].indexOf(date);
            }
            if (index > -1) {
                return [{ x: formatDate(date), y: parseFloat(data[focusData][index])}]; 
            }
            return [{ x: formatDate(date), y: 0 }]
        }
        return [];
    };

    const plotTarget = () => {
        if (currentSubuser !== undefined && (currentSubuser.age !== '' && currentSubuser.age !== null) && (currentSubuser.gender !== '' && currentSubuser.gender !== null && currentSubuser.gender !== 'O')
            && (dates !== undefined && dates.length > 0)) {
                const line = parseFloat(json[ageMap(currentSubuser.age)][genderMap(currentSubuser.gender)][focusData]);
                const lineData = dates.map(date => ({x: formatDate(date), y: line}));
          
                return (
                    <VictoryLine 
                        data={lineData}
                        style={{ data: { stroke: "blue", strokeWidth: 5 } }}
                    />
                );
        }
    };

    const plotDot = () => {
    
        return (
            <VictoryBar
                style={{data: {fill: "#0041b0"}}}
                barWidth={windowWidth*0.04}
                data={datePoint()}
                labels={["today"]}
                cornerRadius={styles.barCorner}
            />
        );
    };

    const populateButtons = () => {

        const dietArray = Object.keys(json_unit);

        const renderData = (item) => {

            return(
                <CustomButton
                    text={item.replace('_', ' ')}
                    onPress={() => {setFocusData(item); }}
                    buttonStyle={[styles.button, (focusData === item ? {backgroundColor: '#561ddbcc'} : {})]}
                />
            )
        };

        return (
            <View style={styles.buttonListContainer}>
                <FlatList
                    horizontal
                    style={{flexWrap: 'wrap'}}
                    data = {dietArray}
                    renderItem = {({item}) => {
                        return renderData(item)
                    }}
                    keyExtractor = {item => `${item}`}       
                />
            </View>
        );
    }

    const plot = () => {
 
        const formattedData = () => {

            var returnArray = new Array();

            dates.forEach(((element) => {
                var index = -1
                if (data !== undefined && Object.prototype.hasOwnProperty.call(data, focusData)) {
                    index = data['date'].indexOf(element);
                }
                if (index > -1) {
                    returnArray.push({ x: formatDate(element), y: parseFloat(data[focusData][index]) })
                }
                else {
                    returnArray.push({ x: formatDate(element), y: 0 })
                }
            }));
 
            return returnArray;
        };

        return (
            <VictoryBar
                barWidth={windowWidth*0.04}
                style={{data: {fill: "#00b02f"}}}
                data={formattedData()}
                cornerRadius={styles.barCorner}
            />
        );
        
    };

    const title = () => {
        return (
            <View style={styles.titleContainer}>
                <Text>{ focusData.replace('_', ' ').replace(' kcal', '').replace(' kj', '') } in { json_unit[focusData] }</Text>
            </View>
        );
    };

    const legend = () => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10}}>
                <View style={{width: 35, height: 5, backgroundColor: '#0f12ba' }}></View>
                <Text> { lessThanNutrients.includes(focusData) ? `maximum` : `target`} amount you should have</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.chart}>
                <VictoryChart paddingLeft={5}>
                    { plot() }
                    { plotTarget() }
                    { plotDot() }
                </VictoryChart>
            </View>
            <View style={{marginVertical: 10, padding: 10, alignSelf: 'center', borderRadius: 10, elevation: 3, width: '90%'}}>
                { legend() }
                { title() }
            </View>
            { populateButtons() }
        </View>
    );

}; 

const styles = StyleSheet.create({
    container: {
        minHeight: 300,
        height: '100%',
        backgroundColor: '#fff',

    },
    chart: {
        borderRadius: 10,
        elevation: 3
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 10
    },

    buttonListContainer: {
        width: '95%',
        alignSelf: 'center',
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#561ddb',
        marginBottom: 10
        // backgroundColor: '#000'
    },

    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        minWidth: 100,
        width: 'auto',
        margin: 10,
        elevation: 105,
    },

    graph: {
       // padding: 50,
        width: '80%'
    },

    barCorner: {
        top: 5,
        bottom: 0 
    },

});
