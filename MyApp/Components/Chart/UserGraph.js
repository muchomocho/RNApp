import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { VictoryBar, DataLabel, VictoryChart, VictoryTheme, VictoryLine, VictoryAxis, VictoryGroup, VictoryScatter, VictoryLabel } from "victory-native";
import json from '../../assets/JSON/gov_diet_recommendation.json'
import CustomButton from "../CustomButton";
import { dietDataContainer} from "../../Constant/Constant";

export default function UserGraph ({name, data, userData, dates}) {

    const windowWidth =  Dimensions.get('window').width

    const [focusData, setFocusData] = useState('energy');

    //const [data, setData] = useState({});

    // useEffect(() => {
    //     console.log(data)
    //     setData(data)
    
    //     // Return the function to unsubscribe from the event so it gets removed on unmount
    // }, [data, userData]);

    // function format gender as string from api json
    const genderMap = (genderChar) => {
        if (genderChar === 'M') {
            return "male";
        } 
        if (genderChar === 'F') {
            return "female";
        }
        else return "other";
    };

    // function to return recommended nutrition amount from age
    const ageMap = (age) => {
        if (age === 3 ) {
            return 2;
        }
        if (age === 6) {
            return 5;
        }
        if (age > 7 && age < 11) {
            return 7;
        }
        if (age > 11 && age < 15) {
            return 11;
        }
        if (age > 15 && age < 19) {
            return 15;
        }
        if (age > 19 && age < 50) {
            return 19;
        }
        if (age > 50 && age < 65) {
            return 50;
        }
        if (age > 65 && age < 75) {
            return 65;
        }
        if (age > 75) {
            return 75;
        }
        else return age;
    };

    const lineDomain = () => {

        if (dates !== undefined && dates.length > 0) {
            return { x: [dates[0], dates[dates.length-1]] }
        }
    };

    const datePoint = () => {
        if (data !== undefined && data.length > 0) {
            return [data[data.length - 1]]; 
        }
        return [];
    };

    const plotLine = () => {
        const graphData = data
        const plotTarget = () => {
            const line = json[ageMap(userData.age)][genderMap(userData.gender)][name];
            if (userData.age !== null && userData.gender !== null) {
                return (
                    <VictoryLine domain={lineDomain()}
                        style={{ data: { stroke: "blue", strokeWidth: 5 } }}
                        y={(d) => line}
                    />
                );
            }
        };

        const plotDot = () => {
            return (
                <VictoryScatter
                    style={{data: {fill: "green"}}}
                    size={10}
                    data={datePoint()}
                    labels={["today"]}
                />
            );
        };


        return (
            <VictoryChart width={Dimensions.get('window').width*0.9} style={{tickLabels: {angle: -60}, ...styles.graph}}>
                <VictoryGroup>
                    
                    <VictoryLine
                        style={{ data: { stroke: "green" } }}
                        data={graphData}
                    />
                    {plotTarget()}
                    {plotDot()}
                </VictoryGroup>

            </VictoryChart>
        );
    };

    const plotTarget = () => {
        if (userData !== undefined) {
            const line = json[ageMap(userData.age)][genderMap(userData.gender)][name];
            if (userData.age !== null && userData.gender !== null) {
                return (
                    <VictoryLine domain={lineDomain()}
                        style={{ data: { stroke: "blue", strokeWidth: 5 } }}
                        y={(d) => line}
                    />
                );
            }
        }
    };

    const plotDot = () => {
        return (
            <VictoryScatter
                style={{data: {fill: "green"}}}
                size={10}
                data={datePoint()}
                labels={["today"]}
            />
        );
    };

    const populateButtons = () => {

        const dietArray = Object.keys(dietDataContainer()).map((key) => key);

        const renderData = (item) => {
            var isToggle = false;
            if (item === focusData) {
                isToggle = true;
            }

            return(
                <CustomButton
                    text={item}
                    onPress={() => {setFocusData(item); isToggle=true; }}
                    isToggle={isToggle}
                    isHoldToggle={true}
                    buttonStyle={styles.button}
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

        if (data !== undefined && Object.prototype.hasOwnProperty.call(data, focusData)) {

            const formattedData = () => {
                var returnArray = new Array();
                data[focusData].forEach((element, index, array) => {
                    returnArray.push({ x: data['date'][index], y: element })
                });
                return returnArray;
            };
            console.log('yo',formattedData())
            return (
                <VictoryChart>
                    <VictoryLine
                        data={formattedData()}
                    />
                </VictoryChart>
            );
        }
    };

    return (
        <View style={styles.container}>
            {plot()}
            {/* {plotTarget()} */}
            {populateButtons()}
        </View>
    );

}; 

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

    buttonListContainer: {
        height: '30%',
        // backgroundColor: '#000'
    },

    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        minWidth: 100,
        width: 'auto',
        margin: 10
    },

    graph: {
        padding: 50,
        width: '80%'
    }
});
