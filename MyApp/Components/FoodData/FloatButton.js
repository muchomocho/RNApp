import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from "../CustomButton";
import ManualFoodDataInput  from "./ManualFoodDataInput";
import FoodDataSelectionList from "./FoodDataSelectionList";



export default function FloatButton({ navigation, isEditingFood=false, isShowManualModalInitial=false, showManualButton=true, showListButton=false }) {

    const { recordList } = useSelector(state => state.mealRecord);
    const { name, amount_in_grams, id, nutrient_data, image } = useSelector(state => state.fooddata.fooddata);
    const [isShowListModal, setIsShowListModal] = useState(false);
    const [isShowManualModal, setIsShowManualModal] = useState(isShowManualModalInitial); // default false

    const listIndicator = () => {
        if (recordList.length > 0) {
            return (
                <View style={styles.listNumberIndicator}>
                    <Text> { recordList.length } </Text>
                </View>
            );
        }
        return
    }

    const manualIndicator = () => {

        if (nutrient_data.length > 0 || name.length > 0 || amount_in_grams.length > 1 || id > -1 || image.uri.length > 0 ) {
            return (
                <View style={styles.listNumberIndicator}>
                    <Text> ! </Text>
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

    const buttons  = () => {
        return (
            <View style={styles.buttonContainer}>
               { 
                    showManualButton &&
                    <View>
                        { manualIndicator() }
                        <CustomButton
                            buttonStyle={styles.button}
                            textStyle={styles.buttonText}
                            text="Create"
                            onPress={onPressManual}
                        />
                    </View>
                }
                {
                    showListButton &&
                    <View>
                        { listIndicator() }

                        <CustomButton
                            buttonStyle={styles.button}
                            textStyle={styles.buttonText}
                            text="list"
                            onPress={onPressList}
                        />
                    </View>
                }
            </View>
        );
    }

    const switchShowManualModal = () => { setIsShowManualModal(!isShowManualModal); };
    const switchShowListModal = () => { setIsShowListModal(!isShowListModal) };
    const foodDataOnSubmit = () => { navigation.navigate('User record'); };


    const modals = () => {
        return (
                <View>
                    {
                        showManualButton && 
                        <View>
                            <Modal
                                animationType="slide"
                                visible={isShowManualModal} >
                                <CustomButton
                                    buttonStyle={styles.closeButton}
                                    textStyle={styles.closeButtontext}
                                    text="close"
                                    onPress={switchShowManualModal}
                                />
                                <ManualFoodDataInput onSubmit={switchShowManualModal} navigation={navigation} isUpdate={isEditingFood} />
                            </Modal>
                        </View>
                    }
                    { 
                        showListButton && 
                        <View>
                            <Modal
                                animationType="slide"
                                visible={isShowListModal} >
                                <CustomButton
                                    buttonStyle={styles.closeButton}
                                    textStyle={styles.closeButtontext}
                                    text="close"
                                    onPress={switchShowListModal}
                            />
                                <FoodDataSelectionList onSubmit={foodDataOnSubmit} navigation={navigation} />
                            </Modal>
                        </View>
                    }
                </View>
            );
    }

    return (
        <>
            { buttons() }
            { modals() }
        </>
    )

};

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#000',
        //alignContent: 'center'
        marginTop: 50,
        height: '100%'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 70,
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