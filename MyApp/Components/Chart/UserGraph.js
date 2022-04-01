import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryLine, VictoryAxis } from "victory-native";
import json from '../../assets/JSON/gov_diet_recommendation.json'

export default function UserGraph ({name, data, userData}) {

    const formatToVictory = (data) => {
    };

    const genderMap = (genderChar) => {
        if (genderChar === 'M') {
            return "male";
        } 
        if (genderChar === 'F') {
            return "female";
        }
        else return "other";
    };

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

    const plotLine = (data) => {
        console.log(data)

        if (userData.age !== null && userData.gender !== null) {
            const line = json[ageMap(userData.age)][genderMap(userData.gender)][name];

            return (
                <VictoryChart width={350} height={250} >

                    <VictoryLine 
                        y={() => line}
                        labels={({datum}) => datum.y} />
                </VictoryChart>
            );
        }
            
        

        // return(
        //     <VictoryChart width={250} >
        //         <VictoryLine data={data} />
        //     </VictoryChart>
        // );
    };

    return (
        <View>
            { plotLine(data) }
            <Text>{name}</Text>
        </View>
    );

}; 
