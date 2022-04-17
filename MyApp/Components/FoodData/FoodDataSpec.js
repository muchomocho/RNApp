import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList } from 'react-native';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';
import { useSelector, useDispatch } from 'react-redux';
import { addRecordSelection, clearRecord } from '../../redux/actions'

export default function FoodDataSpec({navigation, foodData, isRecording=false, isUpdating=false}) {
    const { user, curerentSubuser, subuserArray, recordList } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const [amount, setAmount] = useState(''+foodData.amount_in_grams);
    const [foregroundHeight, setForegroundHeight] = useState(0);

    const addToRecord = () => {
        var mealRecordContent = {};
        mealRecordContent.foodData = foodData;
        mealRecordContent.amount_in_grams = parseFloat(amount);
        //console.log('content',mealRecordContent)
        if (isUpdating) {
            // update
        } else {
            dispatch(addRecordSelection(mealRecordContent));
        }
        navigation.navigate('Create record')
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
                    <Text style={styles.infoContainerTextRight}>{ item.value + unit }</Text>
                </View>
            </View>
        )
    }

    const foregroundElement = () => {
        if (isRecording) {
            
            return (
                <View style={styles.foreground} onLayout={(event) => {setForegroundHeight(event.nativeEvent.layout.height);}}>
                    <View style={[{alignContent: 'center'}, styles.amount]}>
                        <Text> amount you had: </Text>
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
                    <CustomButton
                        //buttonStyle={styles.button}
                        onPress={addToRecord}
                        text={'add to list'}
                    />
                </View>
            );
        }
    };

    const footer = () => {
        if (isRecording) {
            return(
                <View style={[{marginBottom: foregroundHeight},]}>
                    
                </View>
            );
        }
        return(
            <View style={[{marginBottom: 70}]}>

            </View>
        );
    }

    const foodDataView = () => {
        var objArray = [];

        for (var prop in foodData.value) {
            objArray.push({key: prop, value: foodData.value[prop] * amount / foodData.amount_in_grams})
        }
    
        return(
            <View>
                <FlatList
                ListHeaderComponent={
                    <View style={[styles.nameContainer, styles.header]}>
                        <Text style={[styles.nameContainerText, {marginTop: 10}]}>{ foodData.name }, </Text>
                        <Text style={[styles.nameContainerText, {marginBottom: 10}]}>per { amount }g</Text>
                    </View>
                }

                data = {objArray}
                renderItem = {({item}) => {
                    return renderData(item)
                }}
                keyExtractor = {item => item.key}
                
                ListFooterComponent={
                    footer()
                }
                
                />
                { foregroundElement() }
            </View>
        );
    };

    return (
        foodDataView()
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
        height: 'auto',
        alignItems: 'center'
    },
    nameContainerText: {
        color: '#fff',
        height: 25,
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
    foreground:{
        left: 0,
        bottom: 0,
        position: 'absolute',
        width: '100%'
    },
    amount: {
        height: 100,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    amountInput: {
        borderColor: '#000',
        borderRadius: 5,
        borderWidth: 2,
        padding: 10
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
});