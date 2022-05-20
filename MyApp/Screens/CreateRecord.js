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

    // const floatButton = () => {
        
    //     const listIndicator = () => {
    //         if (recordList.length > 0) {
    //             return (
    //                 <View style={styles.listNumberIndicator}>
    //                     <Text> { recordList.length } </Text>
    //                 </View>
    //             );
    //         }
    //         return
    //     }

    //     const manualIndicator = () => {
    //         console.log(name, amount_in_grams, id, nutrient_data)
    //         if (nutrient_data.length > 0 || name.length > 0 || amount_in_grams.length > 0 || id > -1 || image.uri.lenght > 0 ) {
    //             return (
    //                 <View style={styles.listNumberIndicator}>
    //                     <Text> ! </Text>
    //                 </View>
    //             );
    //         }
    //         return
    //     }

    //     const onPressManual = () => { 
    //         setIsShowManualModal(true);
    //     };

    //     const onPressList = () => {
    //         setIsShowListModal(!isShowListModal);
    //     };

    //     return (
    //         <View style={styles.buttonContainer}>
    //             <View>
    //                 { manualIndicator() }
    //                 <CustomButton
    //                     buttonStyle={styles.button}
    //                     textStyle={styles.buttonText}
    //                     text="manual input"
    //                     onPress={onPressManual}
    //                 />
    //             </View>

    //             <View>
    //                 { listIndicator() }

    //                 <CustomButton
    //                     buttonStyle={styles.button}
    //                     textStyle={styles.buttonText}
    //                     text="list"
    //                     onPress={onPressList}
    //                 />
    //             </View>
    //         </View>
    //     );
    // };


    // const switchShowManualModal = () => { setIsShowManualModal(!isShowManualModal); };
    // const switchShowListModal = () => { setIsShowListModal(!isShowListModal) };
    // const foodDataOnSubmit = () => { props.navigation.navigate('User record'); };

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

    // const onPressManual = () => { 
    //     setIsShowManualModal(true);
    // };

    // const onPressList = () => {
    //     setIsShowListModal(!isShowListModal);
    // };

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