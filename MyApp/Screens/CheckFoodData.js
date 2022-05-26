import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TextInput, Button, FlatList, Alert, Dimensions } from 'react-native';
import CustomButton from "../Components/CustomButton";
import foodDataUnitJson from '../assets/JSON/food_integrated_dataset_units.json';
import { useSelector } from "react-redux";

import CustomInput from "../Components/CustomInput";
import FoodDataSpec from "../Components/FoodData/FoodDataSpec";
import { httpRequest } from "../API/ServerRequest";
import LoadingView from "../Components/LoadingView";

function CheckFoodData (props) {

    const [fooddata, setFooddata] = useState();
    const [status, setStatus] = useState(-1);
    const {user} = useSelector(state => state.user);

    const getFullFoodData = async (id) => {
        try {
            const isLoggedin = (user != undefined && typeof(user.username) == 'string' && user.username !== '');
            const result = await httpRequest({
                method: 'GET',
                endpoint: `api/fooddata/${id}/`,
                isAuthRequired: isLoggedin,
                navigation: props.navigation
            });

            console.log(result.json)
            if (result.response.status == 200) {
                setFooddata(result.json);
            }
            setStatus(result.response.status);
        }
        catch (error) {
            console.log(error)
        }
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            await getFullFoodData(props.route.params.fooddataID);
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const foodspec = () => {
        if (fooddata == null || fooddata == undefined) {
            return <LoadingView />
        }
        return (
            <FoodDataSpec
                navigation={props.navigation}
                fooddata={fooddata}
                status={status}
                isRecording={props.route.params.isRecording}
                isRecipe={props.route.params.isRecipe}
            />
        );
    }
    
    return(
        <View style={styles.container}>
            { foodspec() }
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginLeft: '5%',
    },
    nameContainer: {
        backgroundColor: '#561ddb',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        height: 50,
        alignItems: 'center'
    },
    nameContainerText: {
        color: '#fff',
        height: '100%',
        textAlignVertical: 'center'
    },
    header: {
        marginTop: '15%'
    },
    infoContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomColor: '#aaa',
        borderBottomWidth: 0.5,
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    infoContainerTextLeft: {
        height: 30,
        textAlignVertical: 'center'
        //flex: 2
    },
    infoContainerTextRight: {
        height: 30,
        textAlignVertical: 'center'
        //flex: 1
    },
    button:{
        left: 0,
        bottom: 0,
        position: 'absolute',
        elevation:3
    },
    amount: {
        height: 100,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    amountInput: {
        borderColor: '#000',
        borderRadius: 5,
        borderWidth: 2
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
});

export default CheckFoodData