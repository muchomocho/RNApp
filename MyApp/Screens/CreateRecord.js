import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Modal } from 'react-native';
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";
import CustomButton from "../Components/CustomButton";
import FoodDataSelectionList from "../Components/FoodData/FoodDataSelectionList";
import { useSelector, useDispatch } from 'react-redux';
import { FloatButton, ManualFoodDataInput } from "../Components/FoodData";
import { clearAllNutritionData } from '../redux/foodDataSlice'
import TabSwitch from "../Components/TabSwitch";
import RecipeList from "../Components/Recipe/RecipeList";


function CreateRecord(props) {

    
    const { recordList } = useSelector(state => state.mealRecord);
    const { name, amount_in_grams, id, nutrient_data, image } = useSelector(state => state.fooddata.fooddata);

    const dispatch = useDispatch();

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {

        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const components = [
        { 
            title: 'Recipe', 
            component: <RecipeList navigation={props.navigation} isRecording={true}/>
        },
        { 
            title: 'Food', 
            component: 
            <FoodDataSelection
                navigation={props.navigation}
                isRecording
            /> 
        }
    ]

    return(
        <View style={styles.container}>
            <TabSwitch titleComponentArray={components}/>
            <FloatButton navigation={props.navigation} showManualButton showListButton isShowManualModalInitial={props.route.params.isShowManualModal} isEditingFood={props.route.params.isEditingFood} />
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#000',
        //alignContent: 'center'
        marginTop: 50,
        flex: 1
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        right: 20,
    },
    button: {
        backgroundColor: '#fff',
        width: 70,
        height: 70,
        borderRadius: 45,
        elevation: 10,
        zIndex: 10
    },
    listNumberIndicator: {
        backgroundColor: '#ffb87a',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20,
        borderRadius: 100,
        left: 2,
        top: 2,
        elevation: 11
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