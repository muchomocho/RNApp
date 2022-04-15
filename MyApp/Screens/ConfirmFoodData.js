import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import UserGraph from "../Components/Chart/UserGraph";
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";

import { useSelector, useDispatch } from 'react-redux';
import { addRecord, clearRecord } from '../redux/actions'

function ConfirmFoodData (props) {

    const { user, curerentSubuser, subuserArray, recordList } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {

        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const renderData = (item) => {
        return(
            <View>
                <View>
                    <Text>{ item.key }</Text>
                </View>
                <View>
                    <Text>{ item.value }</Text>
                </View>
            </View>
        )
    }

    const foodDataView = () => {
        var objArray = [];
        const foodData = props.route.params.foodData;
        for (var prop in foodData.value) {
            objArray.push({key: prop, value: foodData[prop]})
        }
        <FlatList
        ListHeaderComponent={
            <View>
                <Text>{ foodData.name }</Text>
            </View>
        }

        data = {objArray}
        renderItem = {({item}) => {
            return renderData(item)
        }}
        keyExtractor = {item.key}
        />
    };

    return(
        <View style={styles.container}>
            { foodDataView() }
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

export default ConfirmFoodData