import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Dimensions, Modal } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { dietDataContainer } from "../Constant/Constant";
import UserGraph from "../Components/Chart/UserGraph";
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";
import CustomButton from "../Components/CustomButton";
import FoodDataSelectionList from "../Components/FoodData/FoodDataSelectionList";

function CreateRecord(props) {

    const [isShowModal, setIsShowModal] = useState(false);

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
            <CustomButton
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
            text={'list'}
            onPress={()=>{setIsShowModal(!isShowModal)}}
            />
            <Modal
            animationType="slide"
            visible={isShowModal}>
            <CustomButton
            buttonStyle={styles.closeButton}
            textStyle={styles.closeButtontext}
            text={'close'}
            onPress={()=>{setIsShowModal(!isShowModal)}}
            />
            <FoodDataSelectionList/>
            </Modal>
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#000',
        //alignContent: 'center'
        marginTop: 50,
        height: '100%'
    },
    button: {
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 50,
        right: 20,
        borderRadius: 45,
        width: 70,
        height: 70,
        elevation: 10
    },
    buttonText: {
        color: '#000'
    },
    closeButton: {
        backgroundColor: '#ffffff00'
    },
    closeButtontext: {
        color: '#000'
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