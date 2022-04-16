import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TextInput, Button, FlatList, Alert, Dimensions } from 'react-native';
import CustomButton from "../Components/CustomButton";
import foodDataUnitJson from '..//assets/JSON/food_integrated_dataset_units.json';

import { useSelector, useDispatch } from 'react-redux';
import { addRecordSelection, clearRecord } from '../redux/actions'
import CustomInput from "../Components/CustomInput";

function ConfirmFoodData (props) {

    const { user, curerentSubuser, subuserArray, recordList } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const [amount, setAmount] = useState(0);

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {

        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const addToRecord = () => {
        dispatch(addRecordSelection(props.route.params.foodData));
    }

    const renderData = (item) => {
        var unit =  foodDataUnitJson[item.key];
        if (unit == 'microg') { unit = '\u00b5g'; }
        return(
            <View style={styles.infoContainer}>
                <View >
                    <Text style={styles.infoContainerTextLeft}>{ item.key }</Text>
                </View>
                <View >
                    <Text style={styles.infoContainerTextRight}>{ item.value + unit}</Text>
                </View>
            </View>
        )
    }

    const foodDataView = () => {
        var objArray = [];
        const foodData = props.route.params.foodData;
        console.log(foodData)
        for (var prop in foodData.value) {
            objArray.push({key: prop, value: foodData.value[prop]})
        }
        return(

            <FlatList
            ListHeaderComponent={
                <View style={[styles.nameContainer, styles.header]}>
                    <Text style={styles.nameContainerText}>{ foodData.name }, </Text>
                    <Text style={styles.nameContainerText}>{ foodData.amount_in_grams }</Text>
                </View>
            }

            data = {objArray}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => item.key}
            
            ListFooterComponent={
                <View style={[{marginBottom: 70}, styles.amount]}>
                    <View style={{alignContent: 'center'}}>
                        <Text> amount of this you had: </Text>
                        <TextInput 
                            style={styles.amountInput}
                            keyboardType='numeric'
                            onChangeText={(input)=> {
                                input.replace(/[^0-9]/g, '');
                                setAmount(input)
                            }}
                            value={amount}
                            maxLength={10}  //setting limit of input
                            />
                    </View>
                </View>
            }
            
            />
        );
    };

    return(
        <View style={styles.container}>
            { foodDataView() }
            <CustomButton
                buttonStyle={styles.button}
                onPress={addToRecord}
                text={'add to list'}
            />
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

export default ConfirmFoodData