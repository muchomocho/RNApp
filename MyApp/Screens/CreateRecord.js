import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import UserGraph from "../Components/Chart/UserGraph";
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";

function CreateRecord(props) {

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {

        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    return(
        <View style={styles.container}>
            <FoodDataSelection
            navigation={props.navigation}
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

export default CreateRecord