import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Modal } from 'react-native';
import FoodDataSelection from "../Components/FoodData/FoodDataSelection";
import CustomButton from "../Components/CustomButton";
import FoodDataSelectionList from "../Components/FoodData/FoodDataSelectionList";
import { useSelector, useDispatch } from 'react-redux';
import { ManualFoodDataInput } from "../Components/FoodData";
import { clearAllNutritionData } from '../redux/foodDataSlice'


function CreateRecord(props) {

    const [isShowListModal, setIsShowListModal] = useState(false);
    const [isShowManualModal, setIsShowManualModal] = useState(false);
    const { recordList } = useSelector(state => state.mealRecord);

    const dispatch = useDispatch();

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {

        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const floatButton = () => {
        
        const indicator = () => {
            if (recordList.length > 0) {
                return (
                    <View style={styles.listNumberIndicator}>
                        <Text> { recordList.length } </Text>
                    </View>
                );
            }
            return
        }

        const onPressManual = () => { 
            setIsShowManualModal(true);
        };

        const onPressList = () => {
            setIsShowListModal(!isShowListModal);
        };

        return (
            <View style={styles.buttonContainer}>
                
                <CustomButton
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                    text="manual input"
                    onPress={onPressManual}
                />

                <View>
                    { indicator() }

                    <CustomButton
                        buttonStyle={styles.button}
                        textStyle={styles.buttonText}
                        text="list"
                        onPress={onPressList}
                    />
                </View>
            </View>
        );
    };


    const switchShowManualModal = () => { setIsShowManualModal(!isShowManualModal); };
    const switchShowListModal = () => { setIsShowListModal(!isShowListModal) };
    const foodDataOnSubmit = () => { props.navigation.navigate('User record'); };

    return(
        <View style={styles.container}>
            <FoodDataSelection
                navigation={props.navigation}
                isRecording
            />
            { floatButton() }
            <Modal
                animationType="slide"
                visible={isShowManualModal} >
                <CustomButton
                    buttonStyle={styles.closeButton}
                    textStyle={styles.closeButtontext}
                    text="close"
                    onPress={switchShowManualModal}
                />
                <ManualFoodDataInput onSubmit={switchShowManualModal} navigation={props.navigation} />
            </Modal>
            <Modal
                animationType="slide"
                visible={isShowListModal} >
                <CustomButton
                    buttonStyle={styles.closeButton}
                    textStyle={styles.closeButtontext}
                    text="close"
                    onPress={switchShowListModal}
            />
                <FoodDataSelectionList onSubmit={foodDataOnSubmit} navigation={props.navigation} />
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