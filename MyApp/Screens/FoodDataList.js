import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Image } from 'react-native';
import { FoodDataSelection } from "../Components/FoodData";
import SubuserBanner from "../Components/SubuserBanner";
import CheckFoodData from "./CheckFoodData";
import { FloatButton } from "../Components/FoodData";

function FoodDataList({ navigation }) {
    return (
        <View style={{height: '100%'}}>  
            <SubuserBanner/>
            <FoodDataSelection navigation={navigation} isRecording={false}/>
            <FloatButton navigation={navigation} showManualButton />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        marginBottom: 50
    },
    headerContainer: {
        flexDirection: 'row',
    },
    switchMyButtonContainer: {
        flex: 2,
    },
    searchBarContainer: {
        flex: 8,
    },
    foodContainer: {
        flexDirection: 'row',
        height: 150,
        width: '95%',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
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
    detail: {
        marginLeft: 10,
        flex: 1,
        overflow: 'hidden'
    },
    detailTitle: {
        flexWrap: 'wrap',
        fontSize: 16,
        overflow: 'hidden'
    },
    detailText: {
        flexWrap: 'wrap',
        overflow: 'hidden'
    },
    image: {
        flexGrow: 1,
        backgroundColor: '#eee',
        
    },
});

export default FoodDataList;