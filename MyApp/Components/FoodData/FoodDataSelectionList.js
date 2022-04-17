import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList } from 'react-native';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';

import { useSelector, useDispatch } from 'react-redux';
import { addRecordSelection, deleteRecordSelection, clearRecord } from '../../redux/actions'

export default function FoodDataSelectionList() {

    const { user, curerentSubuser, subuserArray, recordList } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    const renderItem = (item) => {

        return(
            <View style={styles.itemContainer}>
                <View style={styles.item}>
                    <Text style={styles.itemTextLeft}>{item.foodData.name}</Text>
                    <Text style={styles.itemTextRight}>{item.amount_in_grams} g</Text>
                    <CustomButton
                    buttonStyle={styles.itemButton}
                    textStyle={styles.itemButtonText}
                    text={'delete'}
                    onPress={()=>{dispatch(deleteRecordSelection(item.foodData.id))}}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList

            data={recordList} renderItem={
               ({item}) => renderItem(item)
            }
            keyExtractor={item => `${item.foodData.id}`}
            ListFooterComponent={
                <View style={styles.footer}>

                </View>
            }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
    },
    footer: {
        marginBottom: 100
    },
    button: {
        textAlign: 'center',
        textAlignVertical: 'center',
        height: 100,
        width: '40%',
        margin: '5%'
    },
    item: {
        flexDirection: 'row',
        padding: 10,
    },
    itemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'auto',
        width: 'auto',
        margin: 5,
        borderRadius: 5,
        elevation: 2,
    },
    itemButton: {
        //width: '100%',
        flex: 1,
    },
    itemButtonText: {
        fontSize: 15
    },
    itemTextLeft: {
        flex: 2,
        paddingRight: 10,
        borderRightColor: '#000',
        borderRightWidth: 1,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    itemTextRight: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
});
