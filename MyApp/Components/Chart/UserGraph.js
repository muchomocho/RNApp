import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { VictoryBar, DataLabel, VictoryChart, VictoryTheme, VictoryLine, VictoryAxis, VictoryGroup, VictoryScatter, VictoryLabel } from "victory-native";
import json from '../../assets/JSON/gov_diet_recommendation.json'
import CustomButton from "../CustomButton";
import { dietDataContainer} from "../../Constant/Constant";

export default function UserGraph ({name, data, userData, dates}) {

    const windowWidth =  Dimensions.get('window').width

    const [focusData, setFocusData] = useState('energy');

    console.log(dates)
    console.log(new Date().getDate())
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

    const formatDate = (dateStr) => {
        return dateStr.split('-')[2];
    }

    const datePoint = () => {
        if (dates !== undefined && dates.length > 0 
            && Object.prototype.hasOwnProperty.call(data, focusData)
            && Object.prototype.hasOwnProperty.call(data, 'date')) {
                const date = dates[dates.length - 1];
                const index = data['date'].indexOf(date);
                if (index > -1) {
                    return [{ x: formatDate(date), y: parseFloat(data[focusData][index])}]; 
                }
                return [{ x: formatDate(date), y: 0 }]
            
        }
        return [];
    };

    const plotTarget = () => {
        if (userData !== undefined && userData.age !== null && userData.gender !== null
            && (dates !== undefined && dates.length > 0)) {
                const line = parseFloat(json[ageMap(userData.age)][genderMap(userData.gender)][focusData]);
                const lineData = dates.map(date => ({x: formatDate(date), y: line}));
                console.log(lineData)
                return (
                    <VictoryLine 
                        data={lineData}
                        style={{ data: { stroke: "blue", strokeWidth: 5 } }}
                    />
                );
        }
    };

    const plotDot = () => {
        console.log(datePoint())
        return (
            <VictoryBar
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

                dates.forEach(((element) => {
                    const index = data['date'].indexOf(element)
                    if (index > -1) {
                        returnArray.push({ x: formatDate(element), y: parseFloat(data[focusData][index]) })
                    }
                    else {
                        returnArray.push({ x: formatDate(element), y: 0 })
                    }
                }));
                // data[focusData].forEach((element, index, array) => {
                //     returnArray.push({ x: data['date'][index], y: element })
                // });
                console.log(returnArray)
                return returnArray;
            };
            return (
                
                    <VictoryBar
                        data={formattedData()}
                    />
            );
        }
    };

    const title = () => {
        return (
            <View style={styles.titleContainer}>
                <Text>{ focusData } in { dietDataContainer()[focusData].unit }</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <VictoryChart>
                { plot() }
                { plotTarget() }
                { plotDot() }
            </VictoryChart>
            { title() }
            { populateButtons() }
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
        margin: 10
    },

    graph: {
       // padding: 50,
        width: '80%'
    }
});
